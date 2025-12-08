import { Router } from 'express';
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  getVideosBySpecialty,
  deleteVideo,
} from '../controllers/videoController';
import { verifyToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { uploadVideo as multerUpload } from '../utils/upload';

const router = Router();

/**
 * Video upload (teacher only)
 */
router.post(
  '/upload',
  verifyToken,
  requireRole('teacher'),
  multerUpload.single('video'),
  uploadVideo
);

/**
 * Get all videos (with pagination and filtering)
 */
router.get('/', verifyToken, getAllVideos);

/**
 * Get videos by specialty (for schools to browse teachers)
 */
router.get('/specialty/:specialtyId', verifyToken, getVideosBySpecialty);

/**
 * Get video by ID
 */
router.get('/:id', verifyToken, getVideoById);

/**
 * Delete video (teacher can delete own, admin can delete any)
 */
router.delete('/:id', verifyToken, requireRole('teacher', 'admin'), deleteVideo);

export default router;
