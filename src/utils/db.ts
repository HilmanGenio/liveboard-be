import { PrismaClient } from '@prisma/client';
import { config } from './config';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

if (config.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Connection test
prisma.$connect()
  .then(() => {
    console.log('📊 Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });

// Graceful shutdown handlers
const gracefulShutdown = async () => {
  console.log('🔄 Shutting down gracefully...');
  await prisma.$disconnect();
  console.log('📊 Database disconnected');
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('beforeExit', gracefulShutdown);
