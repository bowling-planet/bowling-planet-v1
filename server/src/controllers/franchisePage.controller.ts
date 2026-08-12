import { Request, Response } from 'express';
import { FranchisePage, IFranchisePage } from '../models/FranchisePage';
import { uploadMedia, deleteMedia } from '../utils/cloudinary';

// In-memory cache for singleton document
let cachedFranchisePage: IFranchisePage | null = null;

export const getFranchisePage = async (req: Request, res: Response) => {
  try {
    if (cachedFranchisePage) {
      return res.status(200).json({ success: true, data: cachedFranchisePage });
    }

    const data = await FranchisePage.findOne();
    if (!data) {
      // If empty, create an empty skeleton
      const newPage = await FranchisePage.create({});
      cachedFranchisePage = newPage;
      return res.status(200).json({ success: true, data: newPage });
    }

    cachedFranchisePage = data;
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching franchise page:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateFranchisePage = async (req: Request, res: Response) => {
  try {
    let updateData = { ...req.body };

    // Parse JSON arrays/objects if they come from FormData
    if (typeof updateData.valueProps === 'string') updateData.valueProps = JSON.parse(updateData.valueProps);
    if (typeof updateData.investmentTiers === 'string') updateData.investmentTiers = JSON.parse(updateData.investmentTiers);
    if (typeof updateData.faqs === 'string') updateData.faqs = JSON.parse(updateData.faqs);
    if (typeof updateData.whyUs === 'string') updateData.whyUs = JSON.parse(updateData.whyUs);
    if (typeof updateData.offerings === 'string') updateData.offerings = JSON.parse(updateData.offerings);
    if (typeof updateData.process === 'string') updateData.process = JSON.parse(updateData.process);
    if (typeof updateData.qualifications === 'string') updateData.qualifications = JSON.parse(updateData.qualifications);

    const existingData = await FranchisePage.findOne();

    // Process image uploads
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        if (file.fieldname.startsWith('whyUsImage_')) {
          const idx = parseInt(file.fieldname.split('_')[1], 10);
          if (updateData.whyUs?.[idx]) {
            const oldPublicId = existingData?.whyUs?.[idx]?.image?.public_id;
            if (oldPublicId) await deleteMedia(oldPublicId).catch(() => {});
            
            const uploaded = await uploadMedia(file.buffer, { folder: 'franchise/whyus' });
            updateData.whyUs[idx].image = { url: uploaded.url, public_id: uploaded.publicId };
          }
        } else if (file.fieldname.startsWith('offeringsImage_')) {
          const idx = parseInt(file.fieldname.split('_')[1], 10);
          if (updateData.offerings?.[idx]) {
            const oldPublicId = existingData?.offerings?.[idx]?.image?.public_id;
            if (oldPublicId) await deleteMedia(oldPublicId).catch(() => {});
            
            const uploaded = await uploadMedia(file.buffer, { folder: 'franchise/offerings' });
            updateData.offerings[idx].image = { url: uploaded.url, public_id: uploaded.publicId };
          }
        } else if (file.fieldname.startsWith('processImage_')) {
          const idx = parseInt(file.fieldname.split('_')[1], 10);
          if (updateData.process?.[idx]) {
            const oldPublicId = existingData?.process?.[idx]?.image?.public_id;
            if (oldPublicId) await deleteMedia(oldPublicId).catch(() => {});
            
            const uploaded = await uploadMedia(file.buffer, { folder: 'franchise/process' });
            updateData.process[idx].image = { url: uploaded.url, public_id: uploaded.publicId };
          }
        }
      }
    }

    const updated = await FranchisePage.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    );

    // Update cache
    cachedFranchisePage = updated;

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating franchise page:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
