import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { env } from './env';

export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

const redisUrl = env.REDIS_URL;
const isTLS = redisUrl.startsWith('rediss://');

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  ...(isTLS && { tls: { rejectUnauthorized: false } }),
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('Redis connected');
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('PostgreSQL connected');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
    process.exit(1);
  }

  // Redis is non-critical — don't crash if it fails
  try {
    await redis.connect();
  } catch (err: any) {
    console.warn('Redis connection failed (OTP will use DB fallback):', err.message);
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  try { redis.disconnect(); } catch {}
}
