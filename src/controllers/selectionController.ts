import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../types.js';
import {
  sendWhatsAppNotification,
  formatTeacherSelectionMessage,
} from '../services/whatsappService.js';
import { env } from '../config/env.js';

export const acceptTeacher = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { schoolId, teacherId, videoId } = req.body;

    if (!schoolId || !teacherId) {
      res.status(400).json({
        success: false,
        message: 'School ID and Teacher ID are required',
      });
      return;
    }

    if (req.user?.role === 'school' && req.user.userId !== schoolId) {
      res.status(403).json({
        success: false,
        message: 'You can only select teachers for your own school',
      });
      return;
    }

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: { selectedTeachers: { select: { id: true } } },
    });
    if (!school) {
      res.status(404).json({
        success: false,
        message: 'School not found',
      });
      return;
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });
    if (!teacher) {
      res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
      return;
    }

    if (school.selectedTeachers.some((selected: any) => selected.id === teacherId)) {
      res.status(400).json({
        success: false,
        message: 'Teacher is already selected by this school',
      });
      return;
    }

    await prisma.school.update({
      where: { id: schoolId },
      data: {
        selectedTeachers: {
          connect: { id: teacherId },
        },
      },
    });

    const message = formatTeacherSelectionMessage(school.schoolName, teacher.fullName, teacher.id);

    await sendWhatsAppNotification(env.ADMIN_WHATSAPP_NUMBER, message);

    res.status(200).json({
      success: true,
      message: 'Teacher selected successfully',
      data: {
        school: {
          id: school.id,
          name: school.schoolName,
        },
        teacher: {
          id: teacher.id,
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

export const getSchoolSelections = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { schoolId } = req.params;

    if (req.user?.role === 'school' && req.user.userId !== schoolId) {
      res.status(403).json({
        success: false,
        message: 'You can only view your own selections',
      });
      return;
    }

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        schoolName: true,
        selectedTeachers: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            nationalID: true,
            gender: true,
            age: true,
            address: true,
            academicQualification: true,
            diploma: true,
            courses: true,
            taughtStages: true,
            workedInOmanBefore: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            specialties: { select: { id: true } },
            videos: { select: { id: true } },
          },
        },
      },
    });

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
          id: school.id,
          name: school.schoolName,
        },
        selectedTeachers: school.selectedTeachers.map((teacher: any) => ({
          ...teacher,
          specialties: teacher.specialties.map((specialty: any) => specialty.id),
          videos: teacher.videos.map((video: any) => video.id),
        })),
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

    if (req.user?.role === 'school' && req.user.userId !== schoolId) {
      res.status(403).json({
        success: false,
        message: 'You can only manage your own selections',
      });
      return;
    }

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true },
    });
    if (!school) {
      res.status(404).json({
        success: false,
        message: 'School not found',
      });
      return;
    }

    await prisma.school.update({
      where: { id: schoolId },
      data: {
        selectedTeachers: {
          disconnect: { id: teacherId },
        },
      },
    });

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
