import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../types.js';
import { getVideoUrl, ensureHttpsUrl } from '../utils/upload.js';

export const uploadVideo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, specialtyId } = req.body;

    if (!req.user || req.user.role !== 'teacher') {
      res.status(403).json({
        success: false,
        message: 'Only teachers can upload videos',
      });
      return;
    }

    const teacherId = req.user.userId;

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        specialties: { select: { id: true, name: true, nameAr: true } },
      },
    });
    if (!teacher) {
      res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
      return;
    }

    if (!specialtyId) {
      res.status(400).json({
        success: false,
        message: 'Specialty is required',
      });
      return;
    }

    const specialty = await prisma.specialty.findUnique({
      where: { id: specialtyId },
    });
    if (!specialty) {
      res.status(404).json({
        success: false,
        message: 'Specialty not found',
      });
      return;
    }

    const hasSpecialty = teacher.specialties.some((s: any) => s.id === specialtyId);
    if (!hasSpecialty) {
      res.status(400).json({
        success: false,
        message: 'You can only upload videos for your registered specialties',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No video file uploaded',
      });
      return;
    }

    const videoUrl = getVideoUrl(req.file.filename, req);
    const computedTitle = title || `${specialty.nameAr || specialty.name} - ${teacher.fullName}`;

    const existingVideo = await prisma.video.findFirst({
      where: {
        teacherId,
        specialtyId,
      },
    });

    if (existingVideo) {
      const updatedVideo = await prisma.video.update({
        where: { id: existingVideo.id },
        data: {
          title: computedTitle,
          videoUrl,
          uploadedAt: new Date(),
        },
      });

      const videoData = {
        ...updatedVideo,
        videoUrl: ensureHttpsUrl(updatedVideo.videoUrl),
      };

      res.status(200).json({
        success: true,
        message: 'Video replaced successfully',
        data: videoData,
      });
      return;
    }

    const video = await prisma.video.create({
      data: {
        teacherId,
        specialtyId,
        title: computedTitle,
        videoUrl,
      },
    });

    const videoData = {
      ...video,
      videoUrl: ensureHttpsUrl(video.videoUrl),
    };

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: videoData,
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

export const getAllVideos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (req.query.teacherId) {
      where.teacherId = req.query.teacherId as string;
    }
    if (req.query.specialtyId) {
      where.specialtyId = req.query.specialtyId as string;
    }

    const videos = await prisma.video.findMany({
      where,
      skip,
      take: limit,
      orderBy: { uploadedAt: 'desc' },
      include: {
        teacher: {
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
          },
        },
        specialty: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    const total = await prisma.video.count({ where });

    const videosData = videos.map((video: any) => {
      const videoObj: any = {
        ...video,
        videoUrl: ensureHttpsUrl(video.videoUrl),
      };
      if (videoObj.teacher?.specialties) {
        videoObj.teacher.specialties = videoObj.teacher.specialties.map(
          (specialty: any) => specialty.id
        );
      }
      return videoObj;
    });

    res.status(200).json({
      success: true,
      data: {
        videos: videosData,
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

export const getVideoById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: {
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
          },
        },
        specialty: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found',
      });
      return;
    }

    const videoData: any = {
      ...video,
      videoUrl: ensureHttpsUrl(video.videoUrl),
    };
    if (videoData.teacher?.specialties) {
      videoData.teacher.specialties = videoData.teacher.specialties.map(
        (specialty: any) => specialty.id
      );
    }

    res.status(200).json({
      success: true,
      data: videoData,
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

export const getVideosBySpecialty = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { specialtyId } = req.params;

    const specialty = await prisma.specialty.findUnique({
      where: { id: specialtyId },
      select: {
        id: true,
        name: true,
        nameAr: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!specialty) {
      res.status(404).json({
        success: false,
        message: 'Specialty not found',
      });
      return;
    }

    const videos = await prisma.video.findMany({
      where: { specialtyId },
      orderBy: { uploadedAt: 'desc' },
      include: {
        teacher: {
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
          },
        },
        specialty: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    const videosData = videos.map((video: any) => {
      const videoObj: any = {
        ...video,
        videoUrl: ensureHttpsUrl(video.videoUrl),
      };
      if (videoObj.teacher?.specialties) {
        videoObj.teacher.specialties = videoObj.teacher.specialties.map((s: any) => s.id);
      }
      return videoObj;
    });

    res.status(200).json({
      success: true,
      data: {
        specialty,
        videos: videosData,
        count: videosData.length,
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

export const deleteVideo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
      select: { id: true, teacherId: true },
    });

    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found',
      });
      return;
    }

    if (req.user?.role === 'teacher' && video.teacherId !== req.user.userId) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own videos',
      });
      return;
    }

    await prisma.video.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully',
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
