import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { wagService } from '../services/wag.service';
import { AuthRequest } from '../types';

const router = Router();

// GET /api/v1/wags — list user's WAGs
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const wags = await wagService.getUserWAGs(req.userId!);
  res.json({ success: true, data: wags });
});

// POST /api/v1/wags — create a WAG
const createWAGSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  state: z.string().min(2).max(50),
  maxMembers: z.number().min(2).max(100).optional(),
});

router.post('/', authenticate, validate(createWAGSchema), async (req: AuthRequest, res: Response) => {
  const wag = await wagService.createWAG(req.userId!, req.body);
  res.status(201).json({ success: true, data: wag });
});

// POST /api/v1/wags/:id/join — join a WAG
router.post('/:id/join', authenticate, async (req: AuthRequest, res: Response) => {
  const result = await wagService.joinWAG(req.userId!, req.params.id);
  res.json({ success: true, data: result });
});

// GET /api/v1/wags/:id — get WAG details
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const wag = await wagService.getWAGDetails(req.userId!, req.params.id);
  res.json({ success: true, data: wag });
});

// POST /api/v1/wags/:id/contribute — contribute to WAG pool
const contributeSchema = z.object({
  amount: z.number().min(50, 'Minimum contribution is ₦50'),
});

router.post('/:id/contribute', authenticate, validate(contributeSchema), async (req: AuthRequest, res: Response) => {
  const result = await wagService.contribute(req.userId!, req.params.id, req.body.amount);
  res.json({ success: true, data: result });
});

export default router;
