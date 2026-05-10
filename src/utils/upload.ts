import multer, { StorageEngine, FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = process.env.VERCEL === '1';

// Use /tmp on Vercel (only writable directory), local uploads dir otherwise
const uploadDir = isVercel
  ? '/tmp/uploads/videos'
  : path.join(__dirname, '../../uploads/videos');

try {
  if (!isVercel && !fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create uploads directory (expected on Vercel).');
}

const storage: StorageEngine = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch (e) {
      console.warn('Could not create upload dir in multer.');
    }
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

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

export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
});

export const getVideoUrl = (filename: string, req: Request): string => {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol || 'http';
  const host = req.get('host');
  return `${protocol}://${host}/uploads/videos/${filename}`;
};

export const ensureHttpsUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  if (process.env.NODE_ENV === 'production' && url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};
