import { Request, Response } from 'express';
import { AboutPage, IAboutPage } from '../models/about';
import { uploadMedia, deleteMedia } from '../utils/cloudinary';

// Simple in-memory cache for the singleton document
// (mirrors homePage.controller.ts / franchisePage.controller.ts)
let cachedAboutPage: IAboutPage | null = null;

// ------------------------------------------------------------------
// GET /about-page — public
// ------------------------------------------------------------------
export const getAboutPage = async (req: Request, res: Response): Promise<void> => {
    try {
        if (cachedAboutPage) {
            res.status(200).json({ success: true, data: cachedAboutPage, cached: true });
            return;
        }

        let data = await AboutPage.findOne();

        // First time this endpoint is hit, create a default (mostly empty) doc
        if (!data) {
            data = await AboutPage.create({});
        }

        cachedAboutPage = data;
        res.status(200).json({ success: true, data, cached: false });
    } catch (error) {
        console.error('Error fetching About page:', error);
        res.status(500).json({ success: false, message: 'Server error fetching about page data' });
    }
};

// ------------------------------------------------------------------
// PUT /about-page — protected (Admin / SuperAdmin)
// Accepts multipart/form-data. Array/object fields arrive as JSON
// strings and are parsed back out; images arrive as files whose
// fieldname encodes which array + index they belong to, e.g.
//   certificationsImage_0, partnersImage_2, galleryImage_1, founderImage
// ------------------------------------------------------------------
export const updateAboutPage = async (req: Request, res: Response): Promise<void> => {
    try {
        let updateData: Record<string, any> = { ...req.body };

        // Parse JSON payloads sent through FormData
        const jsonFields = [
            'intro',
            'certifications',
            'partners',
            'gallery',
            'stats',
            'visionMission',
            'journey',
            'founderNote',
            'whyUs',
        ];
        for (const field of jsonFields) {
            if (typeof updateData[field] === 'string') {
                try {
                    updateData[field] = JSON.parse(updateData[field]);
                } catch {
                    delete updateData[field]; // ignore malformed field rather than 500ing the whole save
                }
            }
        }

        const existingData = await AboutPage.findOne();

        // Process image uploads
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files as Express.Multer.File[]) {
                if (file.fieldname.startsWith('certificationsImage_')) {
                    const idx = parseInt(file.fieldname.split('_')[1], 10);
                    if (updateData.certifications?.[idx]) {
                        const oldPublicId = existingData?.certifications?.[idx]?.image?.public_id;
                        if (oldPublicId) await deleteMedia(oldPublicId).catch(() => { });

                        const uploaded = await uploadMedia(file.buffer, { folder: 'about/certifications' });
                        updateData.certifications[idx].image = { url: uploaded.url, public_id: uploaded.publicId };
                    }
                } else if (file.fieldname.startsWith('partnersImage_')) {
                    const idx = parseInt(file.fieldname.split('_')[1], 10);
                    if (updateData.partners?.[idx]) {
                        const oldPublicId = existingData?.partners?.[idx]?.image?.public_id;
                        if (oldPublicId) await deleteMedia(oldPublicId).catch(() => { });

                        const uploaded = await uploadMedia(file.buffer, { folder: 'about/partners' });
                        updateData.partners[idx].image = { url: uploaded.url, public_id: uploaded.publicId };
                    }
                } else if (file.fieldname.startsWith('galleryImage_')) {
                    const idx = parseInt(file.fieldname.split('_')[1], 10);
                    if (updateData.gallery?.[idx]) {
                        const oldPublicId = existingData?.gallery?.[idx]?.image?.public_id;
                        if (oldPublicId) await deleteMedia(oldPublicId).catch(() => { });

                        const uploaded = await uploadMedia(file.buffer, { folder: 'about/gallery' });
                        updateData.gallery[idx].image = { url: uploaded.url, public_id: uploaded.publicId };
                    }
                } else if (file.fieldname === 'founderImage') {
                    if (updateData.founderNote) {
                        const oldPublicId = existingData?.founderNote?.image?.public_id;
                        if (oldPublicId) await deleteMedia(oldPublicId).catch(() => { });

                        const uploaded = await uploadMedia(file.buffer, { folder: 'about/founder' });
                        updateData.founderNote.image = { url: uploaded.url, public_id: uploaded.publicId };
                    }
                }
            }
        }

        const updated = await AboutPage.findOneAndUpdate(
            {},
            { $set: updateData },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // Invalidate cache so the next GET reflects the change
        cachedAboutPage = updated;

        res.status(200).json({ success: true, message: 'About page updated successfully', data: updated });
    } catch (error) {
        console.error('Error updating About page:', error);
        res.status(500).json({ success: false, message: 'Server error updating about page data' });
    }
};
