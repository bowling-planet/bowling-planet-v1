import { Request, Response } from 'express';
import { GlobalSettings } from '../models/GlobalSettings';

// Simple in-memory cache for ultra-fast load times
let cachedSettings: any = null;

export const getGlobalSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (cachedSettings) {
      res.json({ success: true, data: cachedSettings, cached: true });
      return;
    }

    let data = await GlobalSettings.findOne();

    if (!data) {
      // Creates a document using the defaults specified in the schema
      data = await GlobalSettings.create({});
    }

    cachedSettings = data;
    res.json({ success: true, data, cached: false });
  } catch (error) {
    console.error('Error fetching global settings:', error);
    res.status(500).json({ success: false, message: 'Server error fetching global settings' });
  }
};

export const updateGlobalSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatePayload = req.body;

    const updatedData = await GlobalSettings.findOneAndUpdate(
      {},
      { $set: updatePayload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Invalidate Cache
    cachedSettings = null;

    res.json({ 
      success: true, 
      message: 'Global settings updated successfully', 
      data: updatedData 
    });
  } catch (error) {
    console.error('Error updating global settings:', error);
    res.status(500).json({ success: false, message: 'Server error updating global settings' });
  }
};
