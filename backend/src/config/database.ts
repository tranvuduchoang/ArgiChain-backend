import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
export const DATABASE_CONFIG = {
  url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/agrichain',
  pool: {
    min: 2,
    max: 10,
  },
};

// Prisma client instance
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_CONFIG.url,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma; 