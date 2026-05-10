import { Router } from 'express';
import {
  acceptTeacher,
  getSchoolSelections,
  removeTeacherSelection,
} from '../controllers/selectionController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.post('/accept', verifyToken, requireRole('school', 'admin'), acceptTeacher);

router.get('/school/:schoolId', verifyToken, requireRole('school', 'admin'), getSchoolSelections);

router.delete('/remove', verifyToken, requireRole('school', 'admin'), removeTeacherSelection);

export default router;
