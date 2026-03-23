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
      // Only in dev for testing
      ...(process.env.NODE_ENV === 'development' && { otp: code }),
    };
  }

  /**
   * Verify OTP and create user account + wallet.
   */
  async verifyRegistration(phone: string, code: string, name?: string) {
    const valid = await verifyOTP(phone, code);
    if (!valid) {
      throw new AppError(400, 'INVALID_OTP', 'OTP is invalid or has expired');
    }

    // Create user + wallet in a transaction
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
      ...(process.env.NODE_ENV === 'development' && { otp: code }),
    };
  }

  /**
   * Verify login OTP and return token.
   */
  async verifyLogin(phone: string, code: string) {
    const valid = await verifyOTP(phone, code);
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
