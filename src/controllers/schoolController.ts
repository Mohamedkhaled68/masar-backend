import { Response } from 'express';
import { School } from '../models/School';
import { AuthenticatedRequest } from '../types';

/**
 * Get all schools (with pagination)
 * GET /schools
 */
export const getAllSchools = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const schools = await School.find()
      .select('-password')
      .populate('selectedTeachers')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await School.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        schools,
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
 * Get school by ID
 * GET /schools/:id
 */
export const getSchoolById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const school = await School.findById(req.params.id)
      .select('-password')
      .populate('selectedTeachers');

    if (!school) {
      res.status(404).json({
        success: false,
        message: 'School not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: school,
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
 * Update school profile
 * PUT /schools/:id
 */
export const updateSchool = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const schoolId = req.params.id;

    // Check if school is updating their own profile
    if (req.user?.role === 'school' && req.user.userId !== schoolId) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own profile',
      });
      return;
    }

    // Don't allow updating sensitive fields
    delete req.body.password;
    delete req.body.role;
    delete req.body.whatsappPhone;
    delete req.body.selectedTeachers; // Managed through selection flow

    const school = await School.findByIdAndUpdate(
      schoolId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!school) {
      res.status(404).json({
        success: false,
        message: 'School not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'School profile updated successfully',
      data: school,
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
 * Delete school
 * DELETE /schools/:id
 */
export const deleteSchool = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const school = await School.findByIdAndDelete(req.params.id);

    if (!school) {
      res.status(404).json({
        success: false,
        message: 'School not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'School deleted successfully',
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
