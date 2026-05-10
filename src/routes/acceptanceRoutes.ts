import { Router } from 'express';
import {
  acceptTeacher,
  getSchoolAcceptances,
  getAllAcceptances,
  updateAcceptanceStatus,
  deleteAcceptance,
} from '../controllers/acceptanceController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole, isAdmin } from '../middleware/roleMiddleware.js';

const router = Router();

router.post('/accept', verifyToken, requireRole('school'), acceptTeacher);

router.get('/school', verifyToken, requireRole('school'), getSchoolAcceptances);

router.get('/all', verifyToken, isAdmin, getAllAcceptances);

router.put('/:id/status', verifyToken, isAdmin, updateAcceptanceStatus);

router.delete('/:id', verifyToken, isAdmin, deleteAcceptance);

export default router;
