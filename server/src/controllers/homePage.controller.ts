import { Request, Response } from 'express';
import { HomePage } from '../models/HomePage';
import mongoose from 'mongoose';
import { uploadMedia, deleteMedia } from '../utils/cloudinary';

// Simple in-memory cache
// Note: Cleared on server restart or PUT requests
let cachedHomePageData: any = null;

export const getHomePageData = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Check Cache
    if (cachedHomePageData) {
      res.json({ success: true, data: cachedHomePageData, cached: true });
      return;
    }

    // 2. Fetch from DB if cache miss
    let data = await HomePage.findOne().populate('featuredProjects.projectIds');

    // 3. If no data exists, create a default document
    if (!data) {
      data = await HomePage.create({});
      data = await HomePage.findById(data._id).populate('featuredProjects.projectIds');
    }

    // 4. Set Cache
    cachedHomePageData = data;

    res.json({ success: true, data, cached: false });
  } catch (error) {
    console.error('Error fetching Home Page data:', error);
    res.status(500).json({ success: false, message: 'Server error fetching home page data' });
  }
};

export const updateHomePageData = async (req: Request, res: Response): Promise<void> => {
  try {
    let updatePayload = { ...req.body };

    // Parse JSON arrays/objects if they come from FormData
    if (typeof updatePayload.hero === 'string') updatePayload.hero = JSON.parse(updatePayload.hero);
    if (typeof updatePayload.stats === 'string') updatePayload.stats = JSON.parse(updatePayload.stats);
    if (typeof updatePayload.trustedBrands === 'string') updatePayload.trustedBrands = JSON.parse(updatePayload.trustedBrands);
    if (typeof updatePayload.featuredProjects === 'string') updatePayload.featuredProjects = JSON.parse(updatePayload.featuredProjects);
    if (typeof updatePayload.productCategories === 'string') updatePayload.productCategories = JSON.parse(updatePayload.productCategories);
    if (typeof updatePayload.services === 'string') updatePayload.services = JSON.parse(updatePayload.services);
    if (typeof updatePayload.caseStudies === 'string') updatePayload.caseStudies = JSON.parse(updatePayload.caseStudies);

    // Fetch the existing data to cleanup old images if replaced
    const existingData = await HomePage.findOne();

    // Process image uploads
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        if (file.fieldname.startsWith('servicesImage_')) {
          const idx = parseInt(file.fieldname.split('_')[1], 10);
          if (updatePayload.services?.[idx]) {
            const oldPublicId = existingData?.services?.[idx]?.image?.public_id;
            if (oldPublicId) await deleteMedia(oldPublicId).catch(() => {});
            
            const uploaded = await uploadMedia(file.buffer, { folder: 'homepage/services' });
            updatePayload.services[idx].image = { url: uploaded.url, public_id: uploaded.publicId };
          }
        } else if (file.fieldname.startsWith('caseStudiesImage_')) {
          const idx = parseInt(file.fieldname.split('_')[1], 10);
          if (updatePayload.caseStudies?.[idx]) {
            const oldPublicId = existingData?.caseStudies?.[idx]?.image?.public_id;
            if (oldPublicId) await deleteMedia(oldPublicId).catch(() => {});
            
            const uploaded = await uploadMedia(file.buffer, { folder: 'homepage/casestudies' });
            updatePayload.caseStudies[idx].image = { url: uploaded.url, public_id: uploaded.publicId };
          }
        } else if (file.fieldname.startsWith('trustedBrandsImage_')) {
          const idx = parseInt(file.fieldname.split('_')[1], 10);
          if (updatePayload.trustedBrands?.[idx]) {
            const oldPublicId = existingData?.trustedBrands?.[idx]?.image?.public_id;
            if (oldPublicId) await deleteMedia(oldPublicId).catch(() => {});
            
            const uploaded = await uploadMedia(file.buffer, { folder: 'homepage/trustedbrands' });
            updatePayload.trustedBrands[idx].image = { url: uploaded.url, public_id: uploaded.publicId };
          }
        } else if (file.fieldname.startsWith('productCategoriesImage_')) {
          const idx = parseInt(file.fieldname.split('_')[1], 10);
          if (updatePayload.productCategories?.[idx]) {
            const oldPublicId = existingData?.productCategories?.[idx]?.image?.public_id;
            if (oldPublicId) await deleteMedia(oldPublicId).catch(() => {});
            
            const uploaded = await uploadMedia(file.buffer, { folder: 'homepage/productcategories' });
            updatePayload.productCategories[idx].image = { url: uploaded.url, public_id: uploaded.publicId };
          }
        }
      }
    }

    // 1. Ensure we only have one document. We use findOneAndUpdate without filtering by ID 
    // because there should only be a single singleton document.
    // If it doesn't exist, upsert creates it.
    const updatedData = await HomePage.findOneAndUpdate(
      {}, // Match the first document
      { $set: updatePayload }, // Apply updates
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('featuredProjects.projectIds');

    // 2. Invalidate Cache so next GET request fetches fresh data
    cachedHomePageData = null;

    res.json({ 
      success: true, 
      message: 'Home Page data updated successfully', 
      data: updatedData 
    });
  } catch (error) {
    console.error('Error updating Home Page data:', error);
    res.status(500).json({ success: false, message: 'Server error updating home page data' });
  }
};

