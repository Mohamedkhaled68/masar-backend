import { Router } from 'express';
import {
  searchTeachers,
  getAllTeachers,
  getCurrentTeacher,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController';
import { verifyToken } from '../middleware/authMiddleware';
import { requireRole, isAdmin } from '../middleware/roleMiddleware';

const router = Router();

/**
 * Search teachers (must be before /:id route)
 */
router.get('/search', verifyToken, searchTeachers);

/**
 * Get current authenticated teacher (must be before /:id route)
 */
router.get('/me', verifyToken, requireRole('teacher'), getCurrentTeacher);

/**
 * Public routes (accessible to all authenticated users)
 */
router.get('/', verifyToken, getAllTeachers);
router.get('/:id', verifyToken, getTeacherById);

/**
 * Protected routes (teacher can update own profile, admin can update any)
 */
router.put('/:id', verifyToken, requireRole('teacher', 'admin'), updateTeacher);

/**
 * Admin-only routes
 */
router.delete('/:id', verifyToken, isAdmin, deleteTeacher);

export default router;
