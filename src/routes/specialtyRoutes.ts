import { Router } from 'express';
import {
  getAllSpecialties,
  getSpecialtyById,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
} from '../controllers/specialtyController';
import { verifyToken } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware';

const router = Router();

/**
 * Public routes (accessible to everyone, no authentication required)
 */
router.get('/', getAllSpecialties);
router.get('/:id', getSpecialtyById);

/**
 * Admin-only routes
 */
router.post('/', verifyToken, isAdmin, createSpecialty);
router.put('/:id', verifyToken, isAdmin, updateSpecialty);
router.delete('/:id', verifyToken, isAdmin, deleteSpecialty);

export default router;
