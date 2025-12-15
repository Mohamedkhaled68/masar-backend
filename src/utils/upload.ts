import multer, { StorageEngine, FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads/videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage: StorageEngine = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // Generate clean filename using UUID to avoid special characters
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// File filter - accept only video files
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const allowedMimeTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
  const allowedExtensions = ['.mp4', '.mov', '.webm'];

  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (allowedMimeTypes.includes(mimeType) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, MOV, and WEBM video files are allowed.'));
  }
};

// Multer upload configuration
export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
});

/**
 * Get the public URL for an uploaded video
 */
export const getVideoUrl = (filename: string, req: Request): string => {
  // Force HTTPS in production, or use the detected protocol (considering x-forwarded-proto)
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol || 'http';
  const host = req.get('host');
  return `${protocol}://${host}/uploads/videos/${filename}`;
};

/**
 * Transform video URL to use HTTPS in production
 */
export const ensureHttpsUrl = (url: string): string => {
  if (process.env.NODE_ENV === 'production' && url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};
