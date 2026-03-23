import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { generateReference } from '../utils/crypto';

export class WAGService {
  /**
   * List WAGs the user belongs to.
   */
  async getUserWAGs(userId: string) {
    const memberships = await prisma.wAGMember.findMany({
      where: { userId },
      include: {
        wag: {
          include: {
            members: { select: { userId: true, role: true } },
            _count: { select: { contributions: true } },
          },
        },
      },
    });

    return memberships.map((m: any) => ({
      id: m.wag.id,
      name: m.wag.name,
      description: m.wag.description,
      state: m.wag.state,
      myRole: m.role,
      memberCount: m.wag.members.length,
      maxMembers: m.wag.maxMembers,
      poolBalance: m.wag.poolBalance,
      totalContributions: m.wag._count.contributions,
      contractAddress: m.wag.contractAddress,
    }));
  }

  /**
   * Create a new WAG. Creator becomes admin.
   */
  async createWAG(userId: string, data: {
    name: string;
    description?: string;
    state: string;
    maxMembers?: number;
  }) {
    const wag = await prisma.wAG.create({
      data: {
        name: data.name,
        description: data.description,
        state: data.state,
        adminId: userId,
        maxMembers: data.maxMembers || 30,
        members: {
          create: { userId, role: 'ADMIN' },
        },
      },
    });

    return {
      id: wag.id,
      name: wag.name,
      state: wag.state,
      message: `WAG "${wag.name}" created! Share the group ID with members to join.`,
    };
  }

  /**
   * Join an existing WAG.
   */
  async joinWAG(userId: string, wagId: string) {
    const wag = await prisma.wAG.findUnique({
      where: { id: wagId },
      include: { _count: { select: { members: true } } },
    });

    if (!wag) throw new AppError(404, 'WAG_NOT_FOUND', 'WAG group not found');
    if (!wag.isActive) throw new AppError(400, 'WAG_INACTIVE', 'This WAG is no longer active');
    if (wag._count.members >= wag.maxMembers) {
      throw new AppError(400, 'WAG_FULL', 'This WAG has reached its member limit');
    }

    // Check if already a member
    const existing = await prisma.wAGMember.findUnique({
      where: { wagId_userId: { wagId, userId } },
    });
    if (existing) throw new AppError(409, 'ALREADY_MEMBER', 'You are already a member of this WAG');

    await prisma.wAGMember.create({
      data: { wagId, userId, role: 'MEMBER' },
    });

    return {
      wagId: wag.id,
      wagName: wag.name,
      message: `You've joined "${wag.name}"!`,
    };
  }

  /**
   * Get WAG details including members and recent contributions.
   */
  async getWAGDetails(userId: string, wagId: string) {
    // Verify membership
    const membership = await prisma.wAGMember.findUnique({
      where: { wagId_userId: { wagId, userId } },
    });
    if (!membership) throw new AppError(403, 'NOT_MEMBER', 'You are not a member of this WAG');

    const wag = await prisma.wAG.findUnique({
      where: { id: wagId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, phone: true } } },
        },
        contributions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {},
        },
      },
    });

    if (!wag) throw new AppError(404, 'WAG_NOT_FOUND', 'WAG not found');

    return {
      id: wag.id,
      name: wag.name,
      description: wag.description,
      state: wag.state,
      poolBalance: wag.poolBalance,
      contractAddress: wag.contractAddress,
      myRole: membership.role,
      members: wag.members.map((m: any) => ({
        id: m.user.id,
        name: m.user.name || m.user.phone,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
      recentContributions: wag.contributions.map((c: any) => ({
        id: c.id,
        userId: c.userId,
        amount: c.amount,
        txHash: c.txHash,
        createdAt: c.createdAt,
      })),
    };
  }

  /**
   * Contribute to WAG pool from wallet.
   */
  async contribute(userId: string, wagId: string, amount: number) {
    if (amount < 50) throw new AppError(400, 'MIN_AMOUNT', 'Minimum contribution is ₦50');

    // Verify membership
    const membership = await prisma.wAGMember.findUnique({
      where: { wagId_userId: { wagId, userId } },
    });
    if (!membership) throw new AppError(403, 'NOT_MEMBER', 'You are not a member of this WAG');

    // Verify wallet balance
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || Number(wallet.balance) < amount) {
      throw new AppError(400, 'INSUFFICIENT_BALANCE', 'Wallet balance is insufficient');
    }

    const reference = generateReference();

    const [contribution] = await prisma.$transaction([
      prisma.wAGContribution.create({
        data: { wagId, userId, amount },
      }),
      prisma.wallet.update({
        where: { userId },
        data: { balance: { decrement: amount } },
      }),
      prisma.wAG.update({
        where: { id: wagId },
        data: { poolBalance: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: 'WAG_CONTRIBUTION',
          amount,
          reference,
          status: 'SUCCESS',
          description: `WAG contribution`,
        },
      }),
    ]);

    return {
      contributionId: contribution.id,
      wagId,
      amount,
      reference,
      message: `₦${amount.toLocaleString()} contributed to the group pool!`,
    };
  }
}

export const wagService = new WAGService();
