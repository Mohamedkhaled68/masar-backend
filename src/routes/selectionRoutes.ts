import { Router } from 'express';
import {
  acceptTeacher,
  getSchoolSelections,
  removeTeacherSelection,
} from '../controllers/selectionController';
import { verifyToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

/**
 * School accepts/selects a teacher
 */
router.post('/accept', verifyToken, requireRole('school', 'admin'), acceptTeacher);

/**
 * Get all selections for a school
 */
router.get('/school/:schoolId', verifyToken, requireRole('school', 'admin'), getSchoolSelections);

/**
 * Remove teacher from school's selections
 */
router.delete('/remove', verifyToken, requireRole('school', 'admin'), removeTeacherSelection);

export default router;
