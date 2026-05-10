import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || '5000',
  DATABASE_URL: process.env.DATABASE_URL || '',
  DB_NAME: process.env.DB_NAME || 'masar',
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '7d',
  JWT_SECRET: process.env.JWT_SECRET || 'cf2c283e6544dd0eec7c647cf224635954650cd12a30491b1d08d4905e2b867f',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@masar.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123',
  ADMIN_WHATSAPP_NUMBER: process.env.ADMIN_WHATSAPP_NUMBER || '+96812345678',
  NODE_ENV: process.env.NODE_ENV || 'development',
  BASE_URL: process.env.BASE_URL, // Optional: Override base URL (e.g., https://api.masar.work)
};
