import crypto from 'crypto';
import { prisma, redis } from '../config/database';
import { env } from '../config/env';

/**
 * Generate a 6-digit OTP code.
 */
export function generateOTPCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Create and store an OTP for a phone number.
 * Stores in both database (audit) and Redis (fast lookup).
 */
export async function createOTP(phone: string): Promise<string> {
  const code = generateOTPCode();
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

  // Store in database for audit trail
  await prisma.oTPCode.create({
    data: { phone, code, expiresAt },
  });

  // Store in Redis for fast verification (expires automatically)
  await redis.setex(`otp:${phone}`, env.OTP_EXPIRY_MINUTES * 60, code);

  // In production, send via SMS gateway (Termii, Africa's Talking, etc.)
  if (env.NODE_ENV === 'development') {
    console.log(`[DEV] OTP for ${phone}: ${code}`);
  }

  return code;
}

/**
 * Verify an OTP code for a phone number.
 */
export async function verifyOTP(phone: string, code: string): Promise<boolean> {
  // Check Redis first (fast path)
  const cachedCode = await redis.get(`otp:${phone}`);
  if (cachedCode && cachedCode === code) {
    await redis.del(`otp:${phone}`);

    // Mark as used in database
    await prisma.oTPCode.updateMany({
      where: { phone, code, used: false },
      data: { used: true },
    });

    return true;
  }

  // Fallback to database if Redis unavailable
  const otpRecord = await prisma.oTPCode.findFirst({
    where: {
      phone,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (otpRecord) {
    await prisma.oTPCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });
    return true;
  }

  return false;
}
