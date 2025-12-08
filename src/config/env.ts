import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || '5000',
  MONGO_URI: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/masar',
  DB_NAME: process.env.DB_NAME || 'masar',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '1h',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@masar.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123',
  ADMIN_WHATSAPP_NUMBER: process.env.ADMIN_WHATSAPP_NUMBER || '+96812345678',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
