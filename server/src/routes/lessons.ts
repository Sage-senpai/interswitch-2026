import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { lessonService } from '../services/lesson.service';
import { AuthRequest } from '../types';

const router = Router();

// GET /api/v1/lessons — list all lessons
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const category = req.query.category as string | undefined;
  const lessons = await lessonService.getLessons(req.userId!, category as any);
  res.json({ success: true, data: lessons });
});

// GET /api/v1/lessons/:id — get lesson content
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const lesson = await lessonService.getLesson(req.params.id, req.userId!);
  res.json({ success: true, data: lesson });
});

// POST /api/v1/lessons/:id/complete — mark lesson complete
const completeSchema = z.object({
  score: z.number().min(0).max(100).default(100),
});

router.post('/:id/complete', authenticate, validate(completeSchema), async (req: AuthRequest, res: Response) => {
  const result = await lessonService.completeLesson(req.params.id, req.userId!, req.body.score);
  res.json({ success: true, data: result });
});

export default router;
