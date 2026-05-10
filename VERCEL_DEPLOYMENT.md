# Masar Backend - Vercel Deployment

## Important Notes for Vercel Deployment

### File Upload Limitation

⚠️ **Vercel's serverless functions do NOT support persistent file storage**. Video uploads using Multer will not work in production on Vercel.

### Solutions:

1. **Use Cloud Storage (Recommended)**:
   - AWS S3
   - Cloudinary
   - Google Cloud Storage
   - Azure Blob Storage

2. **Alternative Hosting**:
   - Deploy on Railway, Render, or DigitalOcean for file upload support

### Current Configuration

- The app is configured to skip file upload setup when `VERCEL=1` environment variable is set
- All other API endpoints will work normally
- MongoDB connection works fine with Vercel

### To Deploy:

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables Needed:

- `MONGODB_URI`
- `DB_NAME`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `NODE_ENV=production`
- `PORT=5000`
- `CORS_ORIGIN` (your frontend URL)
