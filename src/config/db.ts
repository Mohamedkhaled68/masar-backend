import { prisma } from '../prisma.js';
import { env } from './env.js';

export const connectDB = async (): Promise<void> => {
  try {
    if (!env.DATABASE_URL) {
      console.warn('DATABASE_URL is not set. Prisma may fail to connect.');
    }

    await prisma.$connect();
    console.log('PostgreSQL Connected');
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
};
