import { Router } from 'express';
import {
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
} from '../controllers/schoolController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole, isAdmin } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', verifyToken, getAllSchools);
router.get('/:id', verifyToken, getSchoolById);

router.put('/:id', verifyToken, requireRole('school', 'admin'), updateSchool);

router.delete('/:id', verifyToken, isAdmin, deleteSchool);

export default router;
