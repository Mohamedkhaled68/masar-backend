import { Router } from 'express';
import {
  registerTeacher,
  registerSchool,
  loginTeacher,
  loginSchool,
  loginAdmin,
} from '../controllers/authController.js';
import { validateTeacherRegistration, validateSchoolRegistration } from '../utils/validators.js';

const router = Router();

router.post('/register/teacher', validateTeacherRegistration, registerTeacher);
router.post('/login/teacher', loginTeacher);

router.post('/register/school', validateSchoolRegistration, registerSchool);
router.post('/login/school', loginSchool);

router.post('/login/admin', loginAdmin);

export default router;
