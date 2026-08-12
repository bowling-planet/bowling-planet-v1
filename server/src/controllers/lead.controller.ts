import { Request, Response } from 'express';
import Lead from '../models/Lead';

import { CreateLeadSchema, PartialLeadSchema } from '../validators/lead.validator';
import { sendLeadNotification } from '../services/emailService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
};



// Type-safe error extraction — never leaks internal object structures
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
};

// ─── Controllers ──────────────────────────────────────────────────────────────

// @desc    Create a new Lead
// @route   POST /api/leads
// @access  Public
export const createLead = async (req: Request, res: Response): Promise<void> => {
  try {
    // SECURITY: Validate and whitelist all incoming fields. Rejects unknown keys.
    const parsed = CreateLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid request data', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { name, phone, email, city, businessDetails, utm, behavior, enquiryItems, device, sessionId } = parsed.data;
    const ip = getClientIp(req);

    // SECURITY: status and isPartial are always set by the server, never the client
    const leadData: any = {
      name, phone, email, city, businessDetails, utm, behavior, device, enquiryItems,
      location: { ip },
      status: 'New' as const,
      isPartial: false,
    };

    // Remove undefined and empty string fields to prevent overwriting existing data
    Object.keys(leadData).forEach(key => {
      if (leadData[key] === undefined || leadData[key] === '') {
        delete leadData[key];
      }
    });

    // 1. Cross-Device Deduplication: Find existing lead by Session OR Email OR Phone
    let existingLead = null;
    const searchConditions = [];
    // SECURITY: Validate sessionId is a proper UUID before using it as a lookup key.
    // An attacker could supply a known sessionId to overwrite another lead's record.
    const isValidSessionId = sessionId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
    if (isValidSessionId) searchConditions.push({ sessionId });
    if (email) searchConditions.push({ email });
    if (phone) searchConditions.push({ phone });

    if (searchConditions.length > 0) {
      // Find the most recently active lead that matches ANY of these criteria
      existingLead = await Lead.findOne({ $or: searchConditions }).sort({ updatedAt: -1 });
    }

    let savedLead;
    let isNewFullLead = false;

    if (existingLead) {
      if (existingLead.isPartial) {
        isNewFullLead = true;
      }
      
      // Preserve and merge contact fields to prevent data loss
      const mergeContactField = (existingVal?: string, newVal?: string) => {
        if (!newVal) return existingVal;
        if (!existingVal) return newVal;
        const normExisting = existingVal.replace(/[\s-]/g, '').toLowerCase();
        const normNew = newVal.replace(/[\s-]/g, '').toLowerCase();
        if (normExisting.includes(normNew)) return existingVal;
        return `${existingVal}, ${newVal}`;
      };

      const mergeText = (existingVal?: string, newVal?: string) => {
        if (!newVal) return existingVal;
        if (!existingVal) return newVal;
        if (existingVal.toLowerCase().includes(newVal.toLowerCase())) return existingVal;
        return `${existingVal} | ${newVal}`;
      };

      leadData.email = mergeContactField(existingLead.email, leadData.email);
      leadData.phone = mergeContactField(existingLead.phone, leadData.phone);
      leadData.city = mergeContactField(existingLead.city, leadData.city);
      leadData.businessDetails = mergeText(existingLead.businessDetails, leadData.businessDetails);

      // Handle names intelligently (filter out placeholders)
      const isPlaceholder = (n?: string) => !n || ['ROI Calculator User', 'Quick WhatsApp (No Name)', 'Exit Intent Lead'].includes(n);
      const cleanExistingName = isPlaceholder(existingLead.name) ? undefined : existingLead.name;
      const cleanNewName = isPlaceholder(leadData.name) ? undefined : leadData.name;
      
      leadData.name = mergeContactField(cleanExistingName, cleanNewName) || existingLead.name || leadData.name;
      
      // Preserve existing roi-report items that might not be in the frontend's cart payload
      const existingRoiReports = (existingLead.enquiryItems || []).filter((i: any) => i.type === 'roi-report');
      const mergedEnquiryItems = new Map();
      
      existingRoiReports.forEach((i: any) => mergedEnquiryItems.set(i.id, i));
      
      if (leadData.enquiryItems) {
        leadData.enquiryItems.forEach((i: any) => mergedEnquiryItems.set(i.id, i));
      }
      
      leadData.enquiryItems = Array.from(mergedEnquiryItems.values());

      // Do not downgrade a Contacted or Closed lead back to New just because they are browsing the site again
      if (existingLead.status === 'Contacted' || existingLead.status === 'Closed') {
        delete leadData.status;
      }

      // Update by _id to guarantee we merge into the deduplicated lead, and bind it to their current active browser session
      savedLead = await Lead.findByIdAndUpdate(
        existingLead._id,
        { $set: { ...leadData, sessionId } },
        { new: true }
      );
    } else {
      isNewFullLead = true;
      const lead = new Lead({ ...leadData, sessionId });
      savedLead = await lead.save();
    }

    // Send admin email notification via Nodemailer asynchronously
    // Only send an email if:
    // 1. This is a brand new lead in the CRM (isNewFullLead)
    // 2. OR the user manually submitted a real form (Contact, Franchise, Cart), which always includes a real name.
    // Background ROI syncs do not include a name, and Quick WhatsApp/ROI initial submits use specific placeholder names.
    const isManualFormSubmission = 
      leadData.name !== undefined && 
      leadData.name !== 'ROI Calculator User' && 
      leadData.name !== 'Quick WhatsApp (No Name)';

    if (isNewFullLead || isManualFormSubmission) {
      sendLeadNotification(savedLead).catch(console.error);
    }

    // SECURITY: Return only a minimal acknowledgement to the public caller.
    // Never expose the full lead document — it contains IP address, device fingerprint,
    // behavioral eventLog, and sessionId that could be used to correlate/spoof future requests.
    res.status(201).json({ success: true, data: { id: savedLead?._id } });
  } catch (error: unknown) {
    // SECURITY: Log full error internally, never expose to client
    console.error('[LeadController] createLead error:', getErrorMessage(error));
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create or update a partial/abandoned Lead
// @route   POST /api/leads/partial
// @access  Public
export const savePartialLead = async (req: Request, res: Response): Promise<void> => {
  try {
    // SECURITY: Validate and whitelist all incoming fields
    const parsed = PartialLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      // Fail silently for partials — no need to alarm the user with validation details
      res.status(400).json({ success: false });
      return;
    }

    const { name, phone, email, city, businessDetails, utm, behavior, enquiryItems, device, sessionId } = parsed.data;
    const ip = getClientIp(req);

    const leadData: any = {
      name, phone, email, city, businessDetails, utm, behavior, device, enquiryItems,
      location: { ip },
      status: 'Abandoned' as const,
      isPartial: true,
    };

    // Remove undefined and empty string fields to prevent overwriting existing data
    Object.keys(leadData).forEach(key => {
      if (leadData[key] === undefined || leadData[key] === '') {
        delete leadData[key];
      }
    });

    // 1. Cross-Device Deduplication: Find existing lead by Session OR Email OR Phone
    let existingLead = null;
    const searchConditions = [];
    // SECURITY: Validate sessionId is a proper UUID before using it as a lookup key.
    const isValidSessionId = sessionId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
    if (isValidSessionId) searchConditions.push({ sessionId });
    if (email) searchConditions.push({ email });
    if (phone) searchConditions.push({ phone });

    if (searchConditions.length > 0) {
      existingLead = await Lead.findOne({ $or: searchConditions }).sort({ updatedAt: -1 });
    }

    if (existingLead) {
      // Preserve existing roi-report items that might not be in the frontend's cart payload
      const existingRoiReports = (existingLead.enquiryItems || []).filter((i: any) => i.type === 'roi-report');
      const mergedEnquiryItems = new Map();
      
      existingRoiReports.forEach((i: any) => mergedEnquiryItems.set(i.id, i));
      
      if (leadData.enquiryItems) {
        leadData.enquiryItems.forEach((i: any) => mergedEnquiryItems.set(i.id, i));
      }
      
      leadData.enquiryItems = Array.from(mergedEnquiryItems.values());
    }

    let savedLead;

    if (existingLead) {
      // Preserve and merge contact fields to prevent data loss
      const mergeContactField = (existingVal?: string, newVal?: string) => {
        if (!newVal) return existingVal;
        if (!existingVal) return newVal;
        const normExisting = existingVal.replace(/[\s-]/g, '').toLowerCase();
        const normNew = newVal.replace(/[\s-]/g, '').toLowerCase();
        if (normExisting.includes(normNew)) return existingVal;
        return `${existingVal}, ${newVal}`;
      };

      const mergeText = (existingVal?: string, newVal?: string) => {
        if (!newVal) return existingVal;
        if (!existingVal) return newVal;
        if (existingVal.toLowerCase().includes(newVal.toLowerCase())) return existingVal;
        return `${existingVal} | ${newVal}`;
      };

      leadData.email = mergeContactField(existingLead.email, leadData.email);
      leadData.phone = mergeContactField(existingLead.phone, leadData.phone);
      leadData.city = mergeContactField(existingLead.city, leadData.city);
      leadData.businessDetails = mergeText(existingLead.businessDetails, leadData.businessDetails);

      // Handle names intelligently (filter out placeholders)
      const isPlaceholder = (n?: string) => !n || ['ROI Calculator User', 'Quick WhatsApp (No Name)', 'Exit Intent Lead'].includes(n);
      const cleanExistingName = isPlaceholder(existingLead.name) ? undefined : existingLead.name;
      const cleanNewName = isPlaceholder(leadData.name) ? undefined : leadData.name;
      
      leadData.name = mergeContactField(cleanExistingName, cleanNewName) || existingLead.name || leadData.name;

      if (!existingLead.isPartial) {
        // Lead is already a full lead. Do not downgrade status to Abandoned or isPartial to true.
        const { status, isPartial, ...safeUpdateData } = leadData;
        savedLead = await Lead.findByIdAndUpdate(
          existingLead._id,
          { $set: { ...safeUpdateData, sessionId } },
          { new: true }
        );
      } else {
        // Safe to update partial lead
        savedLead = await Lead.findByIdAndUpdate(
          existingLead._id,
          { $set: { ...leadData, sessionId } },
          { new: true }
        );
      }
    } else {
      const lead = new Lead({ ...leadData, sessionId });
      savedLead = await lead.save();
    }

    res.status(201).json({ success: true, message: 'Partial lead saved' });
  } catch (error: unknown) {
    console.error('[LeadController] savePartialLead error:', getErrorMessage(error));
    res.status(500).json({ success: false });
  }
};

// @desc    Log a lead behavioral event
// @route   POST /api/leads/event
// @access  Public
export const logLeadEvent = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true, message: 'Event logged' });
};

// @desc    Get all leads (paginated)
// @route   GET /api/leads?page=1&limit=50&status=New
// @access  Private/Admin
export const getLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    // SECURITY: Clamp page and limit to safe ranges to prevent abuse
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    const allowedStatuses = ['New', 'Contacted', 'Closed', 'Abandoned'];
    if (req.query.status && req.query.status !== 'All' && allowedStatuses.includes(req.query.status as string)) {
      filter.status = req.query.status;
    }
    if (req.query.isPartial !== undefined) {
      filter.isPartial = req.query.isPartial === 'true';
    }
    
    const andConditions: any[] = [];

    if (req.query.contactInfo === 'no_contact') {
      andConditions.push({ 
        $and: [
          { $or: [{ phone: { $exists: false } }, { phone: '' }, { phone: null }, { phone: 'Not Provided' }] },
          { $or: [{ email: { $exists: false } }, { email: '' }, { email: null }] }
        ] 
      });
    } else if (req.query.contactInfo === 'has_contact') {
      andConditions.push({ 
        $or: [
          { phone: { $exists: true, $nin: ['', null, 'Not Provided'] } },
          { email: { $exists: true, $nin: ['', null] } }
        ] 
      });
    }

    // Search filter across multiple text fields
    if (req.query.search) {
      // SECURITY: Escape regex special characters before passing to MongoDB.
      // An unescaped ReDoS pattern like ((a+)+)b causes CPU spin on the DB node.
      const rawSearch = (req.query.search as string).slice(0, 100); // hard length cap
      const escaped = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = { $regex: escaped, $options: 'i' };
      andConditions.push({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { city: searchRegex }
        ]
      });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // .lean() returns plain JS objects — 3-5x faster than Mongoose Documents
      Lead.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error('[LeadController] getLeads error:', getErrorMessage(error));
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get a single lead by ID
// @route   GET /api/leads/:id
// @access  Private/Admin
export const getLeadById = async (req: Request, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id).lean();
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }
    res.status(200).json({ success: true, data: lead });
  } catch (error: unknown) {
    console.error('[LeadController] getLeadById error:', getErrorMessage(error));
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update lead status
// @route   PATCH /api/leads/:id/status
// @access  Private/Admin
export const updateLeadStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    if (!['New', 'Contacted', 'Closed', 'Abandoned'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status, isPartial: false },
      { new: true, runValidators: true }
    );

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error: unknown) {
    console.error('[LeadController] updateLeadStatus error:', getErrorMessage(error));
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private/Admin
export const deleteLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: unknown) {
    console.error('[LeadController] deleteLead error:', getErrorMessage(error));
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get aggregated analytics for all leads
// @route   GET /api/leads/analytics
// @access  Private/Admin
export const getLeadAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const [result] = await Lead.aggregate([
      {
        $facet: {
          // 1. Status Breakdown
          statusData: [
            { $group: { _id: { $ifNull: ['$status', 'New'] }, value: { $sum: 1 } } },
            { $project: { name: '$_id', value: 1, _id: 0 } }
          ],
          
          // 2. UTM Sources
          utmData: [
            { $group: { _id: { $ifNull: ['$utm.source', 'Direct/Unknown'] }, value: { $sum: 1 } } },
            { $project: { name: '$_id', value: 1, _id: 0 } }
          ],

          // 3. Daily Leads (last 14 days)
          dailyLeads: [
            { $match: { createdAt: { $gte: fourteenDaysAgo } } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } },
            { $project: { date: '$_id', count: 1, _id: 0 } }
          ],

          // 4. CTA Events (top 5)
          eventData: [
            { $unwind: '$behavior.eventLog' },
            { $group: { _id: { $ifNull: ['$behavior.eventLog.action', '$behavior.eventLog.label'] }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { name: '$_id', count: 1, _id: 0 } }
          ],

          // 5. Device Split
          deviceData: [
            { $group: { _id: '$device.isMobile', count: { $sum: 1 } } },
            {
              $project: {
                name: { $cond: [{ $eq: ['$_id', true] }, 'Mobile', { $cond: [{ $eq: ['$_id', false] }, 'Desktop', 'Unknown'] }] },
                value: '$count',
                _id: 0
              }
            },
            { $match: { name: { $ne: 'Unknown' } } }
          ],

          // 6. Top Enquiry Interests
          enquiryData: [
            { $unwind: '$enquiryItems' },
            { $match: { 'enquiryItems.title': { $exists: true, $ne: null } } },
            { $group: { _id: '$enquiryItems.title', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { name: '$_id', count: 1, _id: 0 } }
          ],
          
          // KPIs
          kpis: [
            {
              $group: {
                _id: null,
                totalLeads: { $sum: 1 },
                newLeads: { $sum: { $cond: [{ $eq: ['$status', 'New'] }, 1, 0] } },
                mobileLeads: { $sum: { $cond: [{ $eq: ['$device.isMobile', true] }, 1, 0] } },
                totalEvents: { $sum: { $size: { $ifNull: ['$behavior.eventLog', []] } } }
              }
            }
          ]
        }
      }
    ]);

    const kpis = result.kpis[0] || { totalLeads: 0, newLeads: 0, mobileLeads: 0, totalEvents: 0 };
    delete result.kpis;

    res.status(200).json({
      success: true,
      data: {
        ...result,
        ...kpis
      }
    });
  } catch (error: unknown) {
    console.error('[LeadController] getLeadAnalytics error:', getErrorMessage(error));
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
