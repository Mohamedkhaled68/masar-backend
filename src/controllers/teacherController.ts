import { Response } from 'express';
import { Teacher } from '../models/Teacher';
import { AuthenticatedRequest } from '../types';

/**
 * Get current authenticated teacher's profile
 * GET /teachers/me
 */
export const getCurrentTeacher = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'teacher') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Only teachers can access this endpoint.',
      });
      return;
    }

    const teacher = await Teacher.findById(req.user.userId).select('-password').populate('videos');

    if (!teacher) {
      res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: teacher,
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
 * Get all teachers (with pagination and filtering)
 * GET /teachers
 */
export const getAllTeachers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    if (req.query.stage) {
      filter.taughtStages = req.query.stage;
    }

    if (req.query.gender) {
      filter.gender = req.query.gender;
    }

    if (req.query.workedInOmanBefore !== undefined) {
      filter.workedInOmanBefore = req.query.workedInOmanBefore === 'true';
    }

    // Get teachers with pagination
    const teachers = await Teacher.find(filter)
      .select('-password')
      .populate('videos')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Teacher.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        teachers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
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
 * Get teacher by ID
 * GET /teachers/:id
 */
export const getTeacherById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacher = await Teacher.findById(req.params.id).select('-password').populate('videos');

    if (!teacher) {
      res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: teacher,
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
 * Update teacher profile
 * PUT /teachers/:id
 */
export const updateTeacher = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.params.id;

    // Check if teacher is updating their own profile
    if (req.user?.role === 'teacher' && req.user.userId !== teacherId) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own profile',
      });
      return;
    }

    // Don't allow updating sensitive fields
    delete req.body.password;
    delete req.body.role;
    delete req.body.phoneNumber;
    delete req.body.nationalID;

    const teacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!teacher) {
      res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Teacher profile updated successfully',
      data: teacher,
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
 * Delete teacher
 * DELETE /teachers/:id
 */
export const deleteTeacher = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!teacher) {
      res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully',
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
