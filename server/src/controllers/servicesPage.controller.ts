import { Request, Response } from 'express';
// Triggering nodemon restart to clear in-memory cache again
import { ServicesPage } from '../models/ServicesPage';
import { uploadMedia, deleteMedia } from '../utils/cloudinary';

let cachedServicesPageData: any = null;

export const getServicesPageData = async (req: Request, res: Response): Promise<void> => {
  try {
    if (cachedServicesPageData) {
      res.json({ success: true, data: cachedServicesPageData, cached: true });
      return;
    }

    let data = await ServicesPage.findOne();

    if (!data) {
      data = await ServicesPage.create({});
    }

    cachedServicesPageData = data;

    res.json({ success: true, data, cached: false });
  } catch (error) {
    console.error('Error fetching Services Page data:', error);
    res.status(500).json({ success: false, message: 'Server error fetching services page data' });
  }
};

export const updateServicesPageData = async (req: Request, res: Response): Promise<void> => {
  try {
    let updatePayload = { ...req.body };

    // Parse JSON arrays from FormData
    if (typeof updatePayload.services === 'string') updatePayload.services = JSON.parse(updatePayload.services);
    if (typeof updatePayload.processSteps === 'string') updatePayload.processSteps = JSON.parse(updatePayload.processSteps);
    if (typeof updatePayload.galleryImages === 'string') updatePayload.galleryImages = JSON.parse(updatePayload.galleryImages);
    if (typeof updatePayload.results === 'string') updatePayload.results = JSON.parse(updatePayload.results);

    const existingData = await ServicesPage.findOne();

    // Process image uploads
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        if (file.fieldname.startsWith('services_')) {
          const idx = parseInt(file.fieldname.split('_')[1], 10);
          if (updatePayload.services?.[idx]) {
            const oldPublicId = existingData?.services?.[idx]?.image?.public_id;
            if (oldPublicId) await deleteMedia(oldPublicId).catch(() => {});
            
            const uploaded = await uploadMedia(file.buffer, { folder: 'servicespage/services' });
            updatePayload.services[idx].image = { url: uploaded.url, public_id: uploaded.publicId };
          }
        } else if (file.fieldname.startsWith('processSteps_')) {
          const idx = parseInt(file.fieldname.split('_')[1], 10);
          if (updatePayload.processSteps?.[idx]) {
            const oldPublicId = existingData?.processSteps?.[idx]?.image?.public_id;
            if (oldPublicId) await deleteMedia(oldPublicId).catch(() => {});
            
            const uploaded = await uploadMedia(file.buffer, { folder: 'servicespage/process' });
            updatePayload.processSteps[idx].image = { url: uploaded.url, public_id: uploaded.publicId };
          }
        } else if (file.fieldname.startsWith('galleryImages_')) {
          const idx = parseInt(file.fieldname.split('_')[1], 10);
          if (updatePayload.galleryImages?.[idx]) {
            const oldPublicId = existingData?.galleryImages?.[idx]?.image?.public_id;
            if (oldPublicId) await deleteMedia(oldPublicId).catch(() => {});
            
            const uploaded = await uploadMedia(file.buffer, { folder: 'servicespage/gallery' });
            updatePayload.galleryImages[idx].image = { url: uploaded.url, public_id: uploaded.publicId };
          }
        } else if (file.fieldname.startsWith('results_')) {
          const idx = parseInt(file.fieldname.split('_')[1], 10);
          if (updatePayload.results?.[idx]) {
            const oldPublicId = existingData?.results?.[idx]?.image?.public_id;
            if (oldPublicId) await deleteMedia(oldPublicId).catch(() => {});
            
            const uploaded = await uploadMedia(file.buffer, { folder: 'servicespage/results' });
            updatePayload.results[idx].image = { url: uploaded.url, public_id: uploaded.publicId };
          }
        }
      }
    }

    const updatedData = await ServicesPage.findOneAndUpdate(
      {},
      { $set: updatePayload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    cachedServicesPageData = null;

    res.json({ 
      success: true, 
      message: 'Services Page data updated successfully', 
      data: updatedData 
    });
  } catch (error) {
    console.error('Error updating Services Page data:', error);
    res.status(500).json({ success: false, message: 'Server error updating services page data' });
  }
};
