import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

type SavingsCategory = 'EDUCATION' | 'BUSINESS' | 'HEALTH' | 'EMERGENCY' | 'FAMILY' | 'CUSTOM';
type Frequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
import { generateReference } from '../utils/crypto';
import { autoPayService } from './payment/autopay.service';

export class SavingsService {
  /**
   * Get all savings goals for a user.
   */
  async getGoals(userId: string) {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return goals.map((g: any) => ({
      id: g.id,
      name: g.name,
      category: g.category,
      target: g.target,
      current: g.current,
      progress: Number(g.target) > 0
        ? Math.round((Number(g.current) / Number(g.target)) * 100)
        : 0,
      autoAmount: g.autoAmount,
      frequency: g.frequency,
      hasAutoPay: !!g.iswToken,
      targetDate: g.targetDate,
      createdAt: g.createdAt,
    }));
  }

  /**
   * Create a new savings goal.
   */
  async createGoal(userId: string, data: {
    name: string;
    category: SavingsCategory;
    target: number;
    targetDate?: string;
  }) {
    const goal = await prisma.savingsGoal.create({
      data: {
        userId,
        name: data.name,
        category: data.category,
        target: data.target,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      },
    });

    return {
      id: goal.id,
      name: goal.name,
      category: goal.category,
      target: goal.target,
      current: goal.current,
      progress: 0,
      message: `Goal "${goal.name}" created! Start saving toward ₦${Number(goal.target).toLocaleString()}`,
    };
  }

  /**
   * Make a manual deposit to a savings goal from wallet.
   */
  async deposit(userId: string, goalId: string, amount: number) {
    const [goal, wallet] = await Promise.all([
      prisma.savingsGoal.findFirst({ where: { id: goalId, userId } }),
      prisma.wallet.findUnique({ where: { userId } }),
    ]);

    if (!goal) throw new AppError(404, 'GOAL_NOT_FOUND', 'Savings goal not found');
    if (!wallet || Number(wallet.balance) < amount) {
      throw new AppError(400, 'INSUFFICIENT_BALANCE', 'Wallet balance is insufficient');
    }

    const reference = generateReference();

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: { balance: { decrement: amount } },
      }),
      prisma.savingsGoal.update({
        where: { id: goalId },
        data: { current: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: 'SAVINGS_DEPOSIT',
          amount,
          reference,
          status: 'SUCCESS',
          description: `Savings deposit - ${goal.name}`,
        },
      }),
    ]);

    const newCurrent = Number(goal.current) + amount;
    const progress = Number(goal.target) > 0
      ? Math.round((newCurrent / Number(goal.target)) * 100)
      : 0;

    const goalReached = newCurrent >= Number(goal.target);

    return {
      goalId,
      deposited: amount,
      newBalance: newCurrent,
      progress,
      goalReached,
      message: goalReached
        ? `Congratulations! You've reached your "${goal.name}" goal!`
        : `₦${amount.toLocaleString()} saved toward "${goal.name}" (${progress}%)`,
    };
  }

  /**
   * Withdraw from a savings goal back to wallet.
   */
  async withdraw(userId: string, goalId: string, amount: number) {
    const goal = await prisma.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) throw new AppError(404, 'GOAL_NOT_FOUND', 'Savings goal not found');
    if (Number(goal.current) < amount) {
      throw new AppError(400, 'INSUFFICIENT_SAVINGS', 'Savings balance is insufficient');
    }

    const reference = generateReference();

    await prisma.$transaction([
      prisma.savingsGoal.update({
        where: { id: goalId },
        data: { current: { decrement: amount } },
      }),
      prisma.wallet.update({
        where: { userId },
        data: { balance: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: 'SAVINGS_WITHDRAWAL',
          amount,
          reference,
          status: 'SUCCESS',
          description: `Savings withdrawal - ${goal.name}`,
        },
      }),
    ]);

    return {
      goalId,
      withdrawn: amount,
      newBalance: Number(goal.current) - amount,
      message: `₦${amount.toLocaleString()} withdrawn from "${goal.name}" to wallet`,
    };
  }

  /**
   * Enable AutoPay recurring savings via Interswitch.
   */
  async enableAutoPay(userId: string, goalId: string, amount: number, frequency: Frequency) {
    return autoPayService.setupRecurring(userId, goalId, amount, frequency);
  }

  /**
   * Cancel AutoPay for a savings goal.
   */
  async cancelAutoPay(userId: string, goalId: string) {
    return autoPayService.cancelRecurring(userId, goalId);
  }
}

export const savingsService = new SavingsService();
