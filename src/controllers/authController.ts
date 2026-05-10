import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma.js';
import { env } from '../config/env.js';
import { generateAccessToken } from '../middleware/authMiddleware.js';

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

export const registerTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      phoneNumber,
      password,
      nationalID,
      gender,
      age,
      address,
      academicQualification,
      diploma,
      courses,
      specialties,
      taughtStages,
      workedInOmanBefore,
    } = req.body;

    const existingPhone = await prisma.teacher.findUnique({
      where: { phoneNumber },
    });
    if (existingPhone) {
      res.status(400).json({
        success: false,
        message: 'Phone number already registered',
      });
      return;
    }

    const existingID = await prisma.teacher.findUnique({
      where: { nationalID },
    });
    if (existingID) {
      res.status(400).json({
        success: false,
        message: 'National ID already registered',
      });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const teacher = await prisma.teacher.create({
      data: {
        fullName,
        phoneNumber,
        password: hashedPassword,
        nationalID,
        gender,
        age,
        address,
        academicQualification,
        diploma,
        courses,
        taughtStages,
        workedInOmanBefore,
        specialties: Array.isArray(specialties)
          ? {
              connect: specialties.map((id: string) => ({ id })),
            }
          : undefined,
      },
    });

    const accessToken = generateAccessToken(teacher.id, 'teacher');

    const { password: _password, ...teacherResponse } = teacher;

    res.status(201).json({
      success: true,
      message: 'Teacher registered successfully',
      data: {
        user: teacherResponse,
        accessToken,
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

export const registerSchool = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      managerName,
      whatsappPhone,
      password,
      schoolName,
      schoolLocation,
      stagesNeeded,
      specialtiesNeeded,
      expectedSalaryRange,
      flightTicketProvided,
      housingProvided,
      housingAllowance,
    } = req.body;

    const existingPhone = await prisma.school.findUnique({
      where: { whatsappPhone },
    });
    if (existingPhone) {
      res.status(400).json({
        success: false,
        message: 'Phone number already registered',
      });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const school = await prisma.school.create({
      data: {
        managerName,
        whatsappPhone,
        password: hashedPassword,
        schoolName,
        schoolLocation,
        stagesNeeded,
        specialtiesNeeded,
        expectedSalaryRange,
        flightTicketProvided,
        housingProvided,
        housingAllowance,
      },
    });

    const accessToken = generateAccessToken(school.id, 'school');

    const { password: _password, ...schoolResponse } = school;

    res.status(201).json({
      success: true,
      message: 'School registered successfully',
      data: {
        user: schoolResponse,
        accessToken,
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

    const teacher = await prisma.teacher.findUnique({
      where: { phoneNumber },
    });

    if (!teacher) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, teacher.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const accessToken = generateAccessToken(teacher.id, 'teacher');

    const { password: _password, ...teacherResponse } = teacher;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: teacherResponse,
        accessToken,
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

    const school = await prisma.school.findUnique({
      where: { whatsappPhone: phoneNumber },
    });

    if (!school) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, school.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const accessToken = generateAccessToken(school.id, 'school');

    const { password: _password, ...schoolResponse } = school;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: schoolResponse,
        accessToken,
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

    const admin = await prisma.user.findUnique({
      where: { email },
    });

    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const accessToken = generateAccessToken(admin.id, 'admin');

    const { password: _password, ...adminResponse } = admin;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: adminResponse,
        accessToken,
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
