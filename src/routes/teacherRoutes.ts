import { Router } from 'express';
import {
  searchTeachers,
  getAllTeachers,
  getCurrentTeacher,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole, isAdmin } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/search', verifyToken, searchTeachers);

router.get('/me', verifyToken, requireRole('teacher'), getCurrentTeacher);

router.get('/', verifyToken, getAllTeachers);
router.get('/:id', verifyToken, getTeacherById);

router.put('/:id', verifyToken, requireRole('teacher', 'admin'), updateTeacher);

router.delete('/:id', verifyToken, isAdmin, deleteTeacher);

export default router;
