import { Router } from 'express';
import {
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
} from '../controllers/schoolController';
import { verifyToken } from '../middleware/authMiddleware';
import { requireRole, isAdmin } from '../middleware/roleMiddleware';

const router = Router();

/**
 * Public routes (accessible to all authenticated users)
 */
router.get('/', verifyToken, getAllSchools);
router.get('/:id', verifyToken, getSchoolById);

/**
 * Protected routes (school can update own profile, admin can update any)
 */
router.put('/:id', verifyToken, requireRole('school', 'admin'), updateSchool);

/**
 * Admin-only routes
 */
router.delete('/:id', verifyToken, isAdmin, deleteSchool);

export default router;
