import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const accelerateUrl = process.env.ACCELERATE_URL || process.env.DATABASE_URL;

export const prisma = new PrismaClient({
  accelerateUrl,
}).$extends(withAccelerate());
