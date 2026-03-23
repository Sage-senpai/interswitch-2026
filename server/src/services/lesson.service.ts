import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

type LessonCategory = 'BUDGETING' | 'SAVING' | 'INVESTING' | 'ENTREPRENEURSHIP' | 'DIGITAL_SAFETY' | 'DEBT_MANAGEMENT';

export class LessonService {
  /**
   * Get all lessons, optionally filtered by category.
   * Includes the current user's progress for each lesson.
   */
  async getLessons(userId: string, category?: LessonCategory) {
    const lessons = await prisma.lesson.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
      },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
      include: {
        userProgress: {
          where: { userId },
          select: { completed: true, score: true, badgeEarned: true, completedAt: true },
        },
      },
    });

    return lessons.map((lesson: any) => {
      const progress = lesson.userProgress[0];
      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        category: lesson.category,
        difficulty: lesson.difficulty,
        duration: lesson.duration,
        badge: lesson.badge,
        reward: lesson.reward,
        completed: progress?.completed || false,
        score: progress?.score || 0,
        badgeEarned: progress?.badgeEarned || null,
      };
    });
  }

  /**
   * Get single lesson with full content.
   */
  async getLesson(lessonId: string, userId: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        userProgress: {
          where: { userId },
        },
      },
    });

    if (!lesson) {
      throw new AppError(404, 'LESSON_NOT_FOUND', 'Lesson not found');
    }

    const progress = lesson.userProgress[0];

    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      category: lesson.category,
      difficulty: lesson.difficulty,
      duration: lesson.duration,
      content: lesson.content,
      badge: lesson.badge,
      reward: lesson.reward,
      completed: progress?.completed || false,
      score: progress?.score || 0,
    };
  }

  /**
   * Mark a lesson as complete. Awards badges and rewards.
   */
  async completeLesson(lessonId: string, userId: string, score: number) {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      throw new AppError(404, 'LESSON_NOT_FOUND', 'Lesson not found');
    }

    // Upsert progress (handles re-completing for better score)
    const progress = await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        score,
        completed: true,
        badgeEarned: lesson.badge,
        completedAt: new Date(),
      },
      update: {
        score: { set: Math.max(score, 0) },
        completed: true,
        badgeEarned: lesson.badge,
        completedAt: new Date(),
      },
    });

    // Award reward (airtime credit equivalent) if first completion
    let rewardAwarded = false;
    if (lesson.reward > 0) {
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (wallet) {
        await prisma.$transaction([
          prisma.wallet.update({
            where: { userId },
            data: { balance: { increment: lesson.reward } },
          }),
          prisma.transaction.create({
            data: {
              userId,
              type: 'REWARD',
              amount: lesson.reward,
              reference: `REWARD-${lessonId}-${userId}-${Date.now()}`,
              status: 'SUCCESS',
              description: `Reward for completing "${lesson.title}"`,
            },
          }),
        ]);
        rewardAwarded = true;
      }
    }

    // Count total progress
    const totalCompleted = await prisma.userProgress.count({
      where: { userId, completed: true },
    });
    const totalLessons = await prisma.lesson.count({ where: { isActive: true } });

    return {
      lessonId,
      score: progress.score,
      badge: progress.badgeEarned,
      reward: rewardAwarded ? lesson.reward : 0,
      rewardMessage: rewardAwarded
        ? `₦${lesson.reward} added to your wallet!`
        : undefined,
      overallProgress: {
        completed: totalCompleted,
        total: totalLessons,
        percentage: Math.round((totalCompleted / totalLessons) * 100),
      },
    };
  }
}

export const lessonService = new LessonService();
