import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import _helmet from 'helmet';
const helmet = _helmet as any;
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import schoolRoutes from './routes/schoolRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import selectionRoutes from './routes/selectionRoutes.js';
import specialtyRoutes from './routes/specialtyRoutes.js';
import acceptanceRoutes from './routes/acceptanceRoutes.js';

import { errorHandler, notFound } from './middleware/errorHandler.js';

const app: Application = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('trust proxy', true);

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'https://api.masar.work',
      'https://masar.work/',
      'https://masar.work',
      'https://www.masar.work',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

if (process.env.VERCEL !== '1') {
  const uploadsDir = path.join(__dirname, '../uploads/videos');
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (e) {
    console.warn('Could not create uploads directory (expected on Vercel).');
  }

  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  app.get('/uploads/videos/:filename', (req: Request, res: Response) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/videos', filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: 'Video not found',
      });
      return;
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=31536000',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  });
}

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Masar Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      teachers: '/api/teachers',
      schools: '/api/schools',
      videos: '/api/videos',
      selection: '/api/selection',
      specialties: '/api/specialties',
      acceptance: '/api/acceptance',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/selection', selectionRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/acceptance', acceptanceRoutes);

app.use(notFound);

app.use(errorHandler);

export default app;
