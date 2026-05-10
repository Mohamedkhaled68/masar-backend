import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../types.js';
import { ensureHttpsUrl } from '../utils/upload.js';

export const searchTeachers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, specialtyId, page = '1', limit = '10' } = req.query;

    const where: any = {};

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const term = search.trim();
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { phoneNumber: { contains: term, mode: 'insensitive' } },
        { nationalID: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (specialtyId && typeof specialtyId === 'string') {
      where.specialties = { some: { id: specialtyId } };
    }

    if (req.query.stage) {
      where.taughtStages = { has: req.query.stage as string };
    }

    if (req.query.gender) {
      where.gender = req.query.gender as string;
    }

    if (req.query.workedInOmanBefore !== undefined) {
      where.workedInOmanBefore = req.query.workedInOmanBefore === 'true';
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const teachers = await prisma.teacher.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        specialties: { select: { id: true, name: true, nameAr: true } },
        videos: { select: { id: true, title: true, videoUrl: true, uploadedAt: true } },
      },
    });

    const total = await prisma.teacher.count({ where });

    const teachersData = (teachers as any[]).map((teacher: any) => {
      const { password, ...teacherObj } = teacher;
      if (teacherObj.videos && Array.isArray(teacherObj.videos)) {
        teacherObj.videos = teacherObj.videos.map((video: any) => ({
          ...video,
          videoUrl: video.videoUrl ? ensureHttpsUrl(video.videoUrl) : '',
        }));
      }
      return teacherObj;
    });

    res.status(200).json({
      success: true,
      data: {
        teachers: teachersData,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
        },
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: 'Failed to search teachers',
        error: error.message,
      });
    }
  }
};

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

    const teacher = await prisma.teacher.findUnique({
      where: { id: req.user.userId },
      include: {
        videos: { select: { id: true, title: true, videoUrl: true, uploadedAt: true } },
      },
    });

    if (!teacher) {
      res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
      return;
    }

    const { password, ...teacherData } = teacher;
    if (teacherData.videos && Array.isArray(teacherData.videos)) {
      teacherData.videos = teacherData.videos.map((video: any) => ({
        ...video,
        videoUrl: video.videoUrl ? ensureHttpsUrl(video.videoUrl) : '',
      }));
    }

    res.status(200).json({
      success: true,
      data: teacherData,
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

export const getAllTeachers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (req.query.specialtyId) {
      where.specialties = { some: { id: req.query.specialtyId as string } };
    }

    if (req.query.stage) {
      where.taughtStages = { has: req.query.stage as string };
    }

    if (req.query.gender) {
      where.gender = req.query.gender as string;
    }

    if (req.query.workedInOmanBefore !== undefined) {
      where.workedInOmanBefore = req.query.workedInOmanBefore === 'true';
    }

    const teachers = await prisma.teacher.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        videos: { select: { id: true, title: true, videoUrl: true, uploadedAt: true } },
      },
    });

    const total = await prisma.teacher.count({ where });

    const teachersData = (teachers as any[]).map((teacher: any) => {
      const { password, ...teacherObj } = teacher;
      if (teacherObj.videos && Array.isArray(teacherObj.videos)) {
        teacherObj.videos = teacherObj.videos.map((video: any) => ({
          ...video,
          videoUrl: video.videoUrl ? ensureHttpsUrl(video.videoUrl) : '',
        }));
      }
      return teacherObj;
    });

    res.status(200).json({
      success: true,
      data: {
        teachers: teachersData,
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

export const getTeacherById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: req.params.id },
      include: {
        videos: { select: { id: true, title: true, videoUrl: true, uploadedAt: true } },
      },
    });

    if (!teacher) {
      res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
      return;
    }

    const { password, ...teacherData } = teacher;
    if (teacherData.videos && Array.isArray(teacherData.videos)) {
      teacherData.videos = teacherData.videos.map((video: any) => ({
        ...video,
        videoUrl: video.videoUrl ? ensureHttpsUrl(video.videoUrl) : '',
      }));
    }

    res.status(200).json({
      success: true,
      data: teacherData,
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

export const updateTeacher = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.params.id;

    if (req.user?.role === 'teacher' && req.user.userId !== teacherId) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own profile',
      });
      return;
    }

    const updateData = { ...req.body };
    delete updateData.password;
    delete updateData.role;
    delete updateData.phoneNumber;
    delete updateData.nationalID;

    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!existingTeacher) {
      res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
      return;
    }

    const teacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: updateData,
      include: {
        specialties: { select: { id: true } },
        videos: { select: { id: true } },
      },
    });

    const { password, ...teacherData } = teacher;
    const responseData = {
      ...teacherData,
      specialties: teacher.specialties.map((specialty: any) => specialty.id),
      videos: teacher.videos.map((video: any) => video.id),
    };

    res.status(200).json({
      success: true,
      message: 'Teacher profile updated successfully',
      data: responseData,
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

export const deleteTeacher = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: req.params.id },
    });

    if (!teacher) {
      res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
      return;
    }

    await prisma.teacher.delete({
      where: { id: req.params.id },
    });

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
