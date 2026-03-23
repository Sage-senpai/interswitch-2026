import { prisma } from '../../config/database';
import { iswConfig } from '../../config/interswitch';
import { generateReference } from '../../utils/crypto';
import { AppError } from '../../middleware/errorHandler';
import { InterswitchBase } from './interswitch.service';

type Frequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

interface RecurringSetupResponse {
  responseCode: string;
  token: string;
  tokenExpiryDate: string;
}

interface RecurringChargeResponse {
  responseCode: string;
  responseDescription: string;
  transactionRef: string;
}

/**
 * AutoPay service — recurring micro-savings deductions via Interswitch.
 * Users set up auto-save schedules (daily/weekly/monthly) that deduct from
 * their linked card and credit their savings goals.
 */
export class AutoPayService extends InterswitchBase {
  /**
   * Set up recurring savings for a savings goal.
   * First payment returns a card token for future charges.
   */
  async setupRecurring(userId: string, goalId: string, amount: number, frequency: Frequency) {
    if (amount < 50) {
      throw new AppError(400, 'MIN_AMOUNT', 'Minimum auto-save amount is ₦50');
    }

    const goal = await prisma.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new AppError(404, 'GOAL_NOT_FOUND', 'Savings goal not found');
    }

    if (goal.iswToken) {
      throw new AppError(409, 'ALREADY_ACTIVE', 'AutoPay is already active for this goal');
    }

    const reference = generateReference();
    const amountInKobo = Math.round(amount * 100);

    try {
      const response = await this.post<RecurringSetupResponse>(
        iswConfig.endpoints.recurringSetup,
        {
          customerId: userId,
          amount: amountInKobo,
          currency: iswConfig.currencyCode,
          frequency: frequency.toUpperCase(),
          startDate: new Date().toISOString().split('T')[0],
          transactionRef: reference,
          redirectUrl: iswConfig.callbackUrl,
        },
      );

      if (response.responseCode === '00' && response.token) {
        // Store the recurring token on the savings goal
        await prisma.savingsGoal.update({
          where: { id: goalId },
          data: {
            iswToken: response.token,
            autoAmount: amount,
            frequency,
          },
        });

        return {
          success: true,
          goalId,
          amount,
          frequency,
          message: `AutoPay activated: ₦${amount.toLocaleString()} ${frequency.toLowerCase()}`,
          nextDeduction: this.getNextDeductionDate(frequency),
        };
      }

      throw new AppError(400, 'SETUP_FAILED', 'Failed to set up recurring payment');

    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(502, 'ISW_ERROR', 'Failed to connect to payment processor');
    }
  }

  /**
   * Execute a scheduled recurring charge.
   * Called by background job scheduler at the appropriate interval.
   */
  async executeRecurringCharge(goalId: string) {
    const goal = await prisma.savingsGoal.findUnique({
      where: { id: goalId },
      include: { user: true },
    });

    if (!goal || !goal.iswToken || !goal.autoAmount || !goal.isActive) {
      return { skipped: true, reason: 'Goal inactive or no recurring token' };
    }

    const reference = generateReference();
    const amount = Number(goal.autoAmount);
    const amountInKobo = Math.round(amount * 100);

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId: goal.userId,
        type: 'SAVINGS_DEPOSIT',
        amount,
        reference,
        status: 'PENDING',
        description: `AutoPay savings - ${goal.name} - ₦${amount.toLocaleString()}`,
      },
    });

    try {
      const response = await this.post<RecurringChargeResponse>(
        iswConfig.endpoints.recurringCharge,
        {
          token: goal.iswToken,
          customerId: goal.userId,
          amount: amountInKobo,
          transactionRef: reference,
        },
      );

      if (response.responseCode === '00') {
        // Credit savings goal and record transaction
        await prisma.$transaction([
          prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: 'SUCCESS' },
          }),
          prisma.savingsGoal.update({
            where: { id: goalId },
            data: { current: { increment: amount } },
          }),
        ]);

        return {
          success: true,
          goalId,
          amount,
          newBalance: Number(goal.current) + amount,
          reference,
        };
      }

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });

      return { success: false, reason: response.responseDescription };

    } catch (error) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });

      return { success: false, reason: 'Payment processor unavailable' };
    }
  }

  /**
   * Cancel recurring savings for a goal.
   */
  async cancelRecurring(userId: string, goalId: string) {
    const goal = await prisma.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new AppError(404, 'GOAL_NOT_FOUND', 'Savings goal not found');
    }

    if (!goal.iswToken) {
      throw new AppError(400, 'NOT_ACTIVE', 'AutoPay is not active for this goal');
    }

    try {
      await this.post(iswConfig.endpoints.recurringCancel, {
        token: goal.iswToken,
        customerId: userId,
      });
    } catch {
      // Even if ISW cancel fails, disable locally
      console.error(`Failed to cancel ISW recurring for goal ${goalId}`);
    }

    await prisma.savingsGoal.update({
      where: { id: goalId },
      data: { iswToken: null, autoAmount: null, frequency: null },
    });

    return {
      success: true,
      goalId,
      message: 'AutoPay has been cancelled',
    };
  }

  private getNextDeductionDate(frequency: Frequency): string {
    const now = new Date();
    switch (frequency) {
      case 'DAILY':
        now.setDate(now.getDate() + 1);
        break;
      case 'WEEKLY':
        now.setDate(now.getDate() + 7);
        break;
      case 'BIWEEKLY':
        now.setDate(now.getDate() + 14);
        break;
      case 'MONTHLY':
        now.setMonth(now.getMonth() + 1);
        break;
    }
    return now.toISOString().split('T')[0];
  }
}

export const autoPayService = new AutoPayService();
