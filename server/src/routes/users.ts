import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import { userService } from '../services/user.service';
import { AuthRequest } from '../types';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(50).optional(),
  lga: z.string().min(2).max(100).optional(),
  language: z.enum(['EN', 'HA', 'YO', 'IG']).optional(),
  avatar: z.string().url().optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// GET /api/v1/users/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const profile = await userService.getProfile(req.userId!);
  res.json({ success: true, data: profile });
});

// PUT /api/v1/users/me
router.put('/me', authenticate, validate(updateProfileSchema), async (req: AuthRequest, res: Response) => {
  const updated = await userService.updateProfile(req.userId!, req.body);
  res.json({ success: true, data: updated });
});

// GET /api/v1/wallet/balance
router.get('/wallet/balance', authenticate, async (req: AuthRequest, res: Response) => {
  const wallet = await userService.getWalletBalance(req.userId!);
  res.json({ success: true, data: wallet });
});

// GET /api/v1/wallet/transactions
router.get('/wallet/transactions', authenticate, validateQuery(paginationSchema), async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await userService.getTransactionHistory(req.userId!, page, limit);
  res.json({ success: true, data: result.transactions, meta: result.meta });
});

export default router;
