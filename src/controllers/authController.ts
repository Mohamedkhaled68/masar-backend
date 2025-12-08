import { Request, Response } from 'express';
import { Teacher } from '../models/Teacher';
import { School } from '../models/School';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../middleware/authMiddleware';

/**
 * Register a new teacher
 * POST /auth/register/teacher
 */
export const registerTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const teacherData = req.body;

    // Check if phone number already exists
    const existingPhone = await Teacher.findOne({
      phoneNumber: teacherData.phoneNumber,
    });
    if (existingPhone) {
      res.status(400).json({
        success: false,
        message: 'Phone number already registered',
      });
      return;
    }

    // Check if national ID already exists
    const existingID = await Teacher.findOne({
      nationalID: teacherData.nationalID,
    });
    if (existingID) {
      res.status(400).json({
        success: false,
        message: 'National ID already registered',
      });
      return;
    }

    // Create new teacher
    const teacher = await Teacher.create(teacherData);

    // Generate tokens
    const accessToken = generateAccessToken(teacher._id.toString(), 'teacher');
    const refreshToken = generateRefreshToken(teacher._id.toString(), 'teacher');

    // Return response (exclude password)
    const teacherResponse = teacher.toObject();
    delete (teacherResponse as any).password;

    res.status(201).json({
      success: true,
      message: 'Teacher registered successfully',
      data: {
        user: teacherResponse,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

/**
 * Register a new school
 * POST /auth/register/school
 */
export const registerSchool = async (req: Request, res: Response): Promise<void> => {
  try {
    const schoolData = req.body;

    // Check if phone number already exists
    const existingPhone = await School.findOne({
      whatsappPhone: schoolData.whatsappPhone,
    });
    if (existingPhone) {
      res.status(400).json({
        success: false,
        message: 'Phone number already registered',
      });
      return;
    }

    // Create new school
    const school = await School.create(schoolData);

    // Generate tokens
    const accessToken = generateAccessToken(school._id.toString(), 'school');
    const refreshToken = generateRefreshToken(school._id.toString(), 'school');

    // Return response (exclude password)
    const schoolResponse = school.toObject();
    delete (schoolResponse as any).password;

    res.status(201).json({
      success: true,
      message: 'School registered successfully',
      data: {
        user: schoolResponse,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

/**
 * Login teacher
 * POST /auth/login/teacher
 */
export const loginTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      res.status(400).json({
        success: false,
        message: 'Phone number and password are required',
      });
      return;
    }

    // Find teacher with password field
    const teacher = await Teacher.findOne({ phoneNumber }).select('+password');

    if (!teacher) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await teacher.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(teacher._id.toString(), 'teacher');
    const refreshToken = generateRefreshToken(teacher._id.toString(), 'teacher');

    // Return response (exclude password)
    const teacherResponse = teacher.toObject();
    delete (teacherResponse as any).password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: teacherResponse,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

/**
 * Login school
 * POST /auth/login/school
 */
export const loginSchool = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      res.status(400).json({
        success: false,
        message: 'Phone number and password are required',
      });
      return;
    }

    // Find school with password field
    const school = await School.findOne({ whatsappPhone: phoneNumber }).select('+password');

    if (!school) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await school.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(school._id.toString(), 'school');
    const refreshToken = generateRefreshToken(school._id.toString(), 'school');

    // Return response (exclude password)
    const schoolResponse = school.toObject();
    delete (schoolResponse as any).password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: schoolResponse,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

/**
 * Login admin
 * POST /auth/login/admin
 */
export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    // Find admin with password field
    const admin = await User.findOne({ email }).select('+password');

    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(admin._id.toString(), 'admin');
    const refreshToken = generateRefreshToken(admin._id.toString(), 'admin');

    // Return response (exclude password)
    const adminResponse = admin.toObject();
    delete (adminResponse as any).password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: adminResponse,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};
