import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { aiService } from '../services/ai.service';
import { AuthRequest } from '../types';

const router = Router();

// POST /api/v1/ai/chat — chat with AI financial advisor
const chatSchema = z.object({
  message: z.string().min(1).max(1000),
});

router.post('/chat', authenticate, validate(chatSchema), async (req: AuthRequest, res: Response) => {
  const result = await aiService.chat(req.userId!, req.body.message);
  res.json({ success: true, data: result });
});

// GET /api/v1/ai/insights — get personalized financial insights
router.get('/insights', authenticate, async (req: AuthRequest, res: Response) => {
  const insights = await aiService.getInsights(req.userId!);
  res.json({ success: true, data: insights });
});

export default router;
