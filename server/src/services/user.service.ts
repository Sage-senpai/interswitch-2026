import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

type Language = 'EN' | 'HA' | 'YO' | 'IG';
type KycStatus = 'PENDING' | 'BASIC' | 'VERIFIED';

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        savingsGoals: { where: { isActive: true } },
        userProgress: { include: { lesson: { select: { title: true, badge: true } } } },
        wagMemberships: { include: { wag: { select: { id: true, name: true, state: true } } } },
      },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    const completedLessons = user.userProgress.filter((p: any) => p.completed).length;
    const badges = user.userProgress
      .filter((p: any) => p.badgeEarned)
      .map((p: any) => p.badgeEarned!);

    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      state: user.state,
      lga: user.lga,
      kycStatus: user.kycStatus,
      language: user.language,
      avatar: user.avatar,
      wallet: user.wallet
        ? { balance: user.wallet.balance, currency: user.wallet.currency }
        : null,
      stats: {
        completedLessons,
        badges,
        activeSavingsGoals: user.savingsGoals.length,
        wagsJoined: user.wagMemberships.length,
      },
      savingsGoals: user.savingsGoals.map((g: any) => ({
        id: g.id,
        name: g.name,
        category: g.category,
        target: g.target,
        current: g.current,
        progress: Number(g.target) > 0
          ? Math.round((Number(g.current) / Number(g.target)) * 100)
          : 0,
      })),
      wags: user.wagMemberships.map((m: any) => m.wag),
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, data: {
    name?: string;
    state?: string;
    lga?: string;
    language?: Language;
    avatar?: string;
  }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      state: user.state,
      lga: user.lga,
      language: user.language,
      avatar: user.avatar,
      kycStatus: user.kycStatus,
    };
  }

  async getWalletBalance(userId: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new AppError(404, 'WALLET_NOT_FOUND', 'Wallet not found for this user');
    }

    return {
      balance: wallet.balance,
      currency: wallet.currency,
    };
  }

  async getTransactionHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: { userId } }),
    ]);

    return {
      transactions: transactions.map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        description: t.description,
        reference: t.reference,
        txHash: t.txHash,
        createdAt: t.createdAt,
      })),
      meta: { page, limit, total },
    };
  }
}

export const userService = new UserService();
