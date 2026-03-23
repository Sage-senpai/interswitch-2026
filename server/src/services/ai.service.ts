import { prisma } from '../config/database';
import { env } from '../config/env';
import axios from 'axios';

const SYSTEM_PROMPT = `You are Purse AI — a warm, encouraging financial advisor for Nigerian women and girls.
Your role is to help users build financial literacy, set savings goals, and make smart money decisions.

Guidelines:
- Use simple, clear language (many users have low literacy levels)
- Be culturally sensitive to Nigerian context (mention naira, local examples)
- Encourage saving, even small amounts ("₦100 saved today is ₦3,000 in a month!")
- Celebrate progress and achievements
- Give practical, actionable advice
- If asked about investments, be conservative and emphasize savings first
- Reference the user's actual data when available (savings goals, wallet balance, lesson progress)
- Never give specific stock picks or gambling advice
- Keep responses concise (under 150 words) unless the user asks for details`;

export class AIService {
  /**
   * Chat with the AI financial advisor.
   */
  async chat(userId: string, message: string) {
    // Gather user context for personalized advice
    const [user, goals, recentTx, progress] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
      }),
      prisma.savingsGoal.findMany({
        where: { userId, isActive: true },
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.userProgress.count({
        where: { userId, completed: true },
      }),
    ]);

    const context = this.buildContext(user, goals, recentTx, progress);

    let aiResponse: string;

    if (env.OPENAI_API_KEY) {
      aiResponse = await this.callOpenAI(message, context);
    } else {
      // Fallback: rule-based responses for hackathon demo
      aiResponse = this.getFallbackResponse(message, context);
    }

    // Store the interaction
    await prisma.aIInteraction.create({
      data: {
        userId,
        message,
        response: aiResponse,
        context: context as object,
      },
    });

    return { message: aiResponse };
  }

  /**
   * Get personalized financial insights based on user data.
   */
  async getInsights(userId: string) {
    const [wallet, goals, transactions, lessonsCompleted] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId } }),
      prisma.savingsGoal.findMany({ where: { userId, isActive: true } }),
      prisma.transaction.findMany({
        where: { userId, status: 'SUCCESS' },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.userProgress.count({ where: { userId, completed: true } }),
    ]);

    const insights: { type: string; title: string; message: string; priority: number }[] = [];

    // Savings insights
    const totalSaved = goals.reduce((sum: number, g: any) => sum + Number(g.current), 0);
    const totalTargets = goals.reduce((sum: number, g: any) => sum + Number(g.target), 0);

    if (goals.length === 0) {
      insights.push({
        type: 'savings',
        title: 'Start Your First Goal',
        message: 'Set a savings goal to start building your financial future. Even ₦500 is a great start!',
        priority: 1,
      });
    } else if (totalTargets > 0) {
      const savingsRate = Math.round((totalSaved / totalTargets) * 100);
      insights.push({
        type: 'savings',
        title: 'Savings Progress',
        message: `You've saved ₦${totalSaved.toLocaleString()} across ${goals.length} goal(s) — that's ${savingsRate}% of your targets. Keep going!`,
        priority: 2,
      });
    }

    // Spending insights
    const weeklySpending = transactions
      .filter((t: any) => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return t.createdAt > weekAgo && ['BILL_PAYMENT', 'P2P_TRANSFER'].includes(t.type);
      })
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    if (weeklySpending > 0) {
      insights.push({
        type: 'spending',
        title: 'Weekly Spending',
        message: `You spent ₦${weeklySpending.toLocaleString()} this week on bills and transfers.`,
        priority: 3,
      });
    }

    // Learning insights
    const totalLessons = await prisma.lesson.count({ where: { isActive: true } });
    if (lessonsCompleted < totalLessons) {
      insights.push({
        type: 'learning',
        title: 'Keep Learning',
        message: `You've completed ${lessonsCompleted} of ${totalLessons} lessons. Each lesson earns you rewards!`,
        priority: 4,
      });
    }

    // AutoPay suggestion
    const goalsWithoutAutoPay = goals.filter((g: any) => !g.iswToken);
    if (goalsWithoutAutoPay.length > 0) {
      insights.push({
        type: 'tip',
        title: 'AutoPay Tip',
        message: `Enable AutoPay on "${goalsWithoutAutoPay[0].name}" to save automatically — you'll never forget!`,
        priority: 5,
      });
    }

    return insights.sort((a, b) => a.priority - b.priority);
  }

  private async callOpenAI(message: string, context: Record<string, unknown>): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `${SYSTEM_PROMPT}\n\nUser context: ${JSON.stringify(context)}` },
            { role: 'user', content: message },
          ],
          max_tokens: 300,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.choices[0]?.message?.content || 'I apologize, I could not generate a response. Please try again.';
    } catch {
      return this.getFallbackResponse(message, context);
    }
  }

  private getFallbackResponse(message: string, context: Record<string, unknown>): string {
    const lower = message.toLowerCase();
    const balance = context.walletBalance as number || 0;
    const goalsCount = context.savingsGoals as number || 0;

    if (lower.includes('save') || lower.includes('saving')) {
      if (goalsCount === 0) {
        return 'Great that you want to start saving! Create your first savings goal — even ₦100 per day adds up to ₦3,000 per month. What are you saving for? Education, business, or emergencies?';
      }
      return `You're doing great with ${goalsCount} savings goal(s)! Try enabling AutoPay to save automatically — small consistent amounts build up fast. A ₦200 daily save becomes ₦73,000 in a year!`;
    }

    if (lower.includes('budget') || lower.includes('spend')) {
      return 'A good rule for budgeting: 50% for needs (food, rent, transport), 30% for wants, and 20% for savings. Start by tracking what you spend this week — you might be surprised where your money goes!';
    }

    if (lower.includes('business') || lower.includes('entrepreneur')) {
      return 'Starting a business is exciting! First, save at least 3 months of expenses as a safety net. Then start small — many successful Nigerian women began with just ₦10,000. What kind of business are you thinking about?';
    }

    if (lower.includes('loan') || lower.includes('borrow')) {
      return 'Before taking a loan, make sure you can comfortably repay it. Complete more financial literacy lessons to build your credit score on Purse — this can help you get better loan terms from our partner institutions.';
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return `Hello! I'm your Purse financial advisor. ${balance > 0 ? `Your wallet has ₦${balance.toLocaleString()}. ` : ''}How can I help you today? I can assist with savings tips, budgeting advice, or help you understand your finances better.`;
    }

    return `That's a great question! I recommend checking our financial literacy lessons for detailed guidance. ${goalsCount === 0 ? 'In the meantime, try setting your first savings goal — every naira counts!' : 'Keep up with your savings goals — you\'re building a strong financial foundation!'}`;
  }

  private buildContext(user: any, goals: any[], transactions: any[], lessonsCompleted: number) {
    return {
      userName: user?.name || 'User',
      walletBalance: user?.wallet ? Number(user.wallet.balance) : 0,
      savingsGoals: goals.length,
      totalSaved: goals.reduce((sum: number, g: any) => sum + Number(g.current), 0),
      recentTransactions: transactions.length,
      lessonsCompleted,
    };
  }
}

export const aiService = new AIService();
