import { Response } from 'express';
import { School } from '../models/School';
import { Teacher } from '../models/Teacher';
import { AuthenticatedRequest } from '../types';
import {
  sendWhatsAppNotification,
  formatTeacherSelectionMessage,
} from '../services/whatsappService';
import { env } from '../config/env';

/**
 * School accepts/selects a teacher
 * POST /selection/accept
 */
export const acceptTeacher = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { schoolId, teacherId, videoId } = req.body;

    // Validate required fields
    if (!schoolId || !teacherId) {
      res.status(400).json({
        success: false,
        message: 'School ID and Teacher ID are required',
      });
      return;
    }

    // Verify school is making the selection for themselves
    if (req.user?.role === 'school' && req.user.userId !== schoolId) {
      res.status(403).json({
        success: false,
        message: 'You can only select teachers for your own school',
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

    // Check if teacher is already selected
    if (school.selectedTeachers.includes(teacher._id)) {
      res.status(400).json({
        success: false,
        message: 'Teacher is already selected by this school',
      });
      return;
    }

    // Add teacher to school's selected teachers
    school.selectedTeachers.push(teacher._id);
    await school.save();

    // Send WhatsApp notification to admin
    const message = formatTeacherSelectionMessage(
      school.schoolName,
      teacher.fullName,
      teacher._id.toString()
    );

    await sendWhatsAppNotification(env.ADMIN_WHATSAPP_NUMBER, message);

    res.status(200).json({
      success: true,
      message: 'Teacher selected successfully',
      data: {
        school: {
          id: school._id,
          name: school.schoolName,
        },
        teacher: {
          id: teacher._id,
          name: teacher.fullName,
        },
        videoId: videoId || null,
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
 * Get all selections for a school
 * GET /selection/school/:schoolId
 */
export const getSchoolSelections = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { schoolId } = req.params;

    // Verify school is accessing their own selections
    if (req.user?.role === 'school' && req.user.userId !== schoolId) {
      res.status(403).json({
        success: false,
        message: 'You can only view your own selections',
      });
      return;
    }

    const school = await School.findById(schoolId).populate('selectedTeachers', '-password');

    if (!school) {
      res.status(404).json({
        success: false,
        message: 'School not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        school: {
          id: school._id,
          name: school.schoolName,
        },
        selectedTeachers: school.selectedTeachers,
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
 * Remove teacher from school's selections
 * DELETE /selection/remove
 */
export const removeTeacherSelection = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { schoolId, teacherId } = req.body;

    if (!schoolId || !teacherId) {
      res.status(400).json({
        success: false,
        message: 'School ID and Teacher ID are required',
      });
      return;
    }

    // Verify school is removing from their own selections
    if (req.user?.role === 'school' && req.user.userId !== schoolId) {
      res.status(403).json({
        success: false,
        message: 'You can only manage your own selections',
      });
      return;
    }

    const school = await School.findById(schoolId);
    if (!school) {
      res.status(404).json({
        success: false,
        message: 'School not found',
      });
      return;
    }

    // Remove teacher from selected teachers
    school.selectedTeachers = school.selectedTeachers.filter((id) => id.toString() !== teacherId);
    await school.save();

    res.status(200).json({
      success: true,
      message: 'Teacher removed from selections',
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
