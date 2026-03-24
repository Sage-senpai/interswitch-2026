import { prisma } from '../config/database';
import { generateToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { createOTP, verifyOTP } from '../utils/otp';

export class AuthService {
  /**
   * Register a new user — sends OTP to phone number.
   */
  async register(phone: string, name?: string) {
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      throw new AppError(409, 'USER_EXISTS', 'An account with this phone number already exists');
    }

    const code = await createOTP(phone);

    return {
      message: 'OTP sent to your phone number',
      phone,
      otp: code, // Returned in response until real SMS is integrated
    };
  }

  /**
   * Verify OTP and create user account + wallet.
   * Accepts code "000000" as a bypass for demo/hackathon purposes.
   */
  async verifyRegistration(phone: string, code: string, name?: string) {
    const isDemoBypass = code === '000000';
    const valid = isDemoBypass || await verifyOTP(phone, code);
    if (!valid) {
      throw new AppError(400, 'INVALID_OTP', 'OTP is invalid or has expired');
    }

    // Check if user already exists (from a previous failed attempt)
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      const token = generateToken(existing.id);
      return {
        user: {
          id: existing.id,
          phone: existing.phone,
          name: existing.name,
          kycStatus: existing.kycStatus,
        },
        token,
      };
    }

    const user = await prisma.user.create({
      data: {
        phone,
        name,
        kycStatus: 'BASIC',
        wallet: {
          create: { balance: 0, currency: 'NGN' },
        },
      },
      include: { wallet: true },
    });

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        kycStatus: user.kycStatus,
        wallet: { balance: user.wallet!.balance, currency: user.wallet!.currency },
      },
      token,
    };
  }

  /**
   * Login — send OTP to existing user's phone.
   */
  async login(phone: string) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'No account found with this phone number');
    }

    const code = await createOTP(phone);

    return {
      message: 'OTP sent to your phone number',
      phone,
      otp: code, // Returned in response until real SMS is integrated
    };
  }

  /**
   * Verify login OTP and return token.
   */
  async verifyLogin(phone: string, code: string) {
    const isDemoBypass = code === '000000';
    const valid = isDemoBypass || await verifyOTP(phone, code);
    if (!valid) {
      throw new AppError(400, 'INVALID_OTP', 'OTP is invalid or has expired');
    }

    const user = await prisma.user.findUnique({
      where: { phone },
      include: { wallet: true },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'No account found with this phone number');
    }

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        kycStatus: user.kycStatus,
        language: user.language,
        wallet: user.wallet
          ? { balance: user.wallet.balance, currency: user.wallet.currency }
          : null,
      },
      token,
    };
  }
}

export const authService = new AuthService();
