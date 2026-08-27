import { Router } from 'express';
import { getAboutPage, updateAboutPage } from '../controllers/about.controller';
import { authenticateJWT } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { upload } from '../middleware/multer';

const router = Router();

// Public route to fetch about page data
router.get('/', getAboutPage);

// Protected route to update about page data (Admin or SuperAdmin only)
router.put('/', authenticateJWT, requireRole(['Admin', 'SuperAdmin']), upload.any(), updateAboutPage);

export default router;
