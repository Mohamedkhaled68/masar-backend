import { Router } from 'express';
import {
  registerTeacher,
  registerSchool,
  loginTeacher,
  loginSchool,
  loginAdmin,
} from '../controllers/authController';
import { validateTeacherRegistration, validateSchoolRegistration } from '../utils/validators';

const router = Router();

/**
 * Teacher routes
 */
router.post('/register/teacher', validateTeacherRegistration, registerTeacher);
router.post('/login/teacher', loginTeacher);

/**
 * School routes
 */
router.post('/register/school', validateSchoolRegistration, registerSchool);
router.post('/login/school', loginSchool);

/**
 * Admin routes
 */
router.post('/login/admin', loginAdmin);

export default router;
