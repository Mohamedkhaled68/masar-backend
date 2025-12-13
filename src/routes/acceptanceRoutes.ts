import { Router } from 'express';
import {
  acceptTeacher,
  getSchoolAcceptances,
  getAllAcceptances,
  updateAcceptanceStatus,
  deleteAcceptance,
} from '../controllers/acceptanceController';
import { verifyToken } from '../middleware/authMiddleware';
import { requireRole, isAdmin } from '../middleware/roleMiddleware';

const router = Router();

/**
 * School accepts a teacher
 */
router.post('/accept', verifyToken, requireRole('school'), acceptTeacher);

/**
 * Get school's acceptance history
 */
router.get('/school', verifyToken, requireRole('school'), getSchoolAcceptances);

/**
 * Admin: Get all acceptances
 */
router.get('/all', verifyToken, isAdmin, getAllAcceptances);

/**
 * Admin: Update acceptance status
 */
router.put('/:id/status', verifyToken, isAdmin, updateAcceptanceStatus);

/**
 * Admin: Delete acceptance
 */
router.delete('/:id', verifyToken, isAdmin, deleteAcceptance);

export default router;
