import { Response } from 'express';
import { Video } from '../models/Video';
import { Teacher } from '../models/Teacher';
import { Specialty } from '../models/Specialty';
import { AuthenticatedRequest } from '../types';
import { getVideoUrl, ensureHttpsUrl } from '../utils/upload';

/**
 * Upload video for teacher
 * POST /videos/upload
 */
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

    // Check if teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
      return;
    }

    // Validate specialty
    if (!specialtyId) {
      res.status(400).json({
        success: false,
        message: 'Specialty is required',
      });
      return;
    }

    const specialty = await Specialty.findById(specialtyId);
    if (!specialty) {
      res.status(404).json({
        success: false,
        message: 'Specialty not found',
      });
      return;
    }

    // Check if teacher has this specialty
    const hasSpecialty = teacher.specialties.some((s: any) => s.toString() === specialtyId);
    if (!hasSpecialty) {
      res.status(400).json({
        success: false,
        message: 'You can only upload videos for your registered specialties',
      });
      return;
    }

    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No video file uploaded',
      });
      return;
    }

    // Generate video URL
    const videoUrl = getVideoUrl(req.file.filename, req);

    // Check if teacher already has a video for this specialty
    const existingVideo = await Video.findOne({
      teacher: teacherId,
      specialty: specialtyId,
    });

    if (existingVideo) {
      // Update existing video (replace)
      existingVideo.title = title || `${specialty.nameAr || specialty.name} - ${teacher.fullName}`;
      existingVideo.videoUrl = videoUrl;
      existingVideo.uploadedAt = new Date();
      await existingVideo.save();

      // Transform video URL to HTTPS
      const videoData = existingVideo.toObject();
      videoData.videoUrl = ensureHttpsUrl(videoData.videoUrl);

      res.status(200).json({
        success: true,
        message: 'Video replaced successfully',
        data: videoData,
      });
      return;
    }

    // Create new video document
    const video = await Video.create({
      teacher: teacherId,
      specialty: specialtyId,
      title: title || `${specialty.nameAr || specialty.name} - ${teacher.fullName}`,
      videoUrl,
    });

    // Add video reference to teacher
    teacher.videos.push(video._id);
    await teacher.save();

    // Transform video URL to HTTPS
    const videoData = video.toObject();
    videoData.videoUrl = ensureHttpsUrl(videoData.videoUrl);

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

/**
 * Get all videos (with pagination and filtering)
 * GET /videos
 */
export const getAllVideos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (req.query.teacherId) {
      filter.teacher = req.query.teacherId;
    }
    if (req.query.specialtyId) {
      filter.specialty = req.query.specialtyId;
    }

    const videos = await Video.find(filter)
      .populate('teacher', '-password')
      .populate('specialty')
      .limit(limit)
      .skip(skip)
      .sort({ uploadedAt: -1 });

    const total = await Video.countDocuments(filter);

    // Transform video URLs to HTTPS in production
    const videosData = videos.map((video) => {
      const videoObj = video.toObject();
      videoObj.videoUrl = ensureHttpsUrl(videoObj.videoUrl);
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

/**
 * Get video by ID
 * GET /videos/:id
 */
export const getVideoById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('teacher', '-password')
      .populate('specialty');

    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found',
      });
      return;
    }

    // Transform video URL to HTTPS
    const videoData = video.toObject();
    videoData.videoUrl = ensureHttpsUrl(videoData.videoUrl);

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

/**
 * Get all videos by specialty (for schools to browse teachers)
 * GET /videos/specialty/:specialtyId
 */
export const getVideosBySpecialty = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { specialtyId } = req.params;

    // Validate specialty exists
    const specialty = await Specialty.findById(specialtyId);
    if (!specialty) {
      res.status(404).json({
        success: false,
        message: 'Specialty not found',
      });
      return;
    }

    // Get all videos for this specialty with teacher details
    const videos = await Video.find({ specialty: specialtyId })
      .populate('teacher', '-password')
      .populate('specialty')
      .sort({ uploadedAt: -1 });

    // Transform video URLs to HTTPS in production
    const videosData = videos.map((video) => {
      const videoObj = video.toObject();
      videoObj.videoUrl = ensureHttpsUrl(videoObj.videoUrl);
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

/**
 * Delete video
 * DELETE /videos/:id
 */
export const deleteVideo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found',
      });
      return;
    }

    // Check if user has permission (teacher can only delete own videos)
    if (req.user?.role === 'teacher' && video.teacher.toString() !== req.user.userId) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own videos',
      });
      return;
    }

    // Remove video reference from teacher
    await Teacher.findByIdAndUpdate(video.teacher, {
      $pull: { videos: video._id },
    });

    // Delete video
    await video.deleteOne();

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
