import { Router } from 'express';
import {
  getAllSpecialties,
  getSpecialtyById,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
} from '../controllers/specialtyController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', getAllSpecialties);
router.get('/:id', getSpecialtyById);

router.post('/', verifyToken, isAdmin, createSpecialty);
router.put('/:id', verifyToken, isAdmin, updateSpecialty);
router.delete('/:id', verifyToken, isAdmin, deleteSpecialty);

export default router;
