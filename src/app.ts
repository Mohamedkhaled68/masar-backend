import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

// Import routes
import authRoutes from './routes/authRoutes';
import teacherRoutes from './routes/teacherRoutes';
import schoolRoutes from './routes/schoolRoutes';
import videoRoutes from './routes/videoRoutes';
import selectionRoutes from './routes/selectionRoutes';
import specialtyRoutes from './routes/specialtyRoutes';
import acceptanceRoutes from './routes/acceptanceRoutes';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler';

const app: Application = express();

/**
 * Middleware
 */
// Security headers - Configure helmet to allow video streaming
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS - Allow frontend origins
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'https://masar.work',
      'https://www.masar.work',
      'http://localhost:3000',
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// IMPORTANT: handle preflight explicitly
app.options('*', cors(corsOptions));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists (skip in serverless environment)
if (process.env.VERCEL !== '1') {
  const uploadsDir = path.join(__dirname, '../uploads/videos');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve static files (uploaded videos) - BEFORE authentication middleware
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Video streaming route with range support
  app.get('/uploads/videos/:filename', (req: Request, res: Response) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/videos', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: 'Video not found',
      });
      return;
    }

    // Get file stats
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Handle range requests for video streaming
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
      // Send entire file
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

/**
 * Routes
 */
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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/selection', selectionRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/acceptance', acceptanceRoutes);

/**
 * Error handling
 */
// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
