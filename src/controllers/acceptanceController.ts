import { Response } from 'express';
import { Acceptance } from '../models/Acceptance';
import { School } from '../models/School';
import { Teacher } from '../models/Teacher';
import { AuthenticatedRequest } from '../types';

/**
 * School accepts a teacher
 * POST /acceptance/accept
 */
export const acceptTeacher = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { teacherId, notes } = req.body;

    if (!req.user || req.user.role !== 'school') {
      res.status(403).json({
        success: false,
        message: 'Only schools can accept teachers',
      });
      return;
    }

    const schoolId = req.user.userId;

    // Validate teacher ID
    if (!teacherId) {
      res.status(400).json({
        success: false,
        message: 'Teacher ID is required',
      });
      return;
    }

    // Find school
    const school = await School.findById(schoolId);
    if (!school) {
      res.status(404).json({
        success: false,
        message: 'School not found',
      });
      return;
    }

    // Find teacher
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
      return;
    }

    // Check if already accepted
    const existingAcceptance = await Acceptance.findOne({
      school: schoolId,
      teacher: teacherId,
    });

    if (existingAcceptance) {
      res.status(400).json({
        success: false,
        message: 'You have already accepted this teacher',
        data: existingAcceptance,
      });
      return;
    }

    // Create acceptance record
    const acceptance = await Acceptance.create({
      school: schoolId,
      teacher: teacherId,
      notes: notes || '',
      status: 'pending',
    });

    // Populate the acceptance data
    const populatedAcceptance = await Acceptance.findById(acceptance._id)
      .populate('school', '-password')
      .populate('teacher', '-password');

    res.status(201).json({
      success: true,
      message: 'Teacher accepted successfully',
      data: populatedAcceptance,
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
 * Get school's acceptance history
 * GET /acceptance/school
 */
export const getSchoolAcceptances = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'school') {
      res.status(403).json({
        success: false,
        message: 'Only schools can access this endpoint',
      });
      return;
    }

    const schoolId = req.user.userId;
    const { status } = req.query;

    // Build filter
    const filter: any = { school: schoolId };
    if (status) {
      filter.status = status;
    }

    const acceptances = await Acceptance.find(filter)
      .populate('teacher', '-password')
      .populate('school', '-password')
      .sort({ acceptedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        count: acceptances.length,
        acceptances,
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
 * Get all acceptances (Admin only)
 * GET /acceptance/all
 */
export const getAllAcceptances = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can access this endpoint',
      });
      return;
    }

    const { status, schoolId, teacherId } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    if (schoolId) {
      filter.school = schoolId;
    }
    if (teacherId) {
      filter.teacher = teacherId;
    }

    const acceptances = await Acceptance.find(filter)
      .populate('school', '-password')
      .populate('teacher', '-password')
      .limit(limit)
      .skip(skip)
      .sort({ acceptedAt: -1 });

    const total = await Acceptance.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        acceptances,
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
 * Update acceptance status (Admin only)
 * PUT /acceptance/:id/status
 */
export const updateAcceptanceStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can update acceptance status',
      });
      return;
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Valid status is required (pending, approved, rejected)',
      });
      return;
    }

    const acceptance = await Acceptance.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true, runValidators: true }
    )
      .populate('school', '-password')
      .populate('teacher', '-password');

    if (!acceptance) {
      res.status(404).json({
        success: false,
        message: 'Acceptance not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Acceptance status updated successfully',
      data: acceptance,
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
 * Delete acceptance (Admin only)
 * DELETE /acceptance/:id
 */
export const deleteAcceptance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can delete acceptances',
      });
      return;
    }

    const { id } = req.params;

    const acceptance = await Acceptance.findByIdAndDelete(id);

    if (!acceptance) {
      res.status(404).json({
        success: false,
        message: 'Acceptance not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Acceptance deleted successfully',
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
