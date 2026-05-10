import { Router } from 'express';
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  getVideosBySpecialty,
  deleteVideo,
} from '../controllers/videoController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { uploadVideo as multerUpload } from '../utils/upload.js';

const router = Router();

router.post(
  '/upload',
  verifyToken,
  requireRole('teacher'),
  multerUpload.single('video'),
  uploadVideo
);

router.get('/', verifyToken, getAllVideos);

router.get('/specialty/:specialtyId', verifyToken, getVideosBySpecialty);

router.get('/:id', verifyToken, getVideoById);

router.delete('/:id', verifyToken, requireRole('teacher', 'admin'), deleteVideo);

export default router;
