import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { savingsService } from '../services/savings.service';
import { AuthRequest } from '../types';

const router = Router();

// GET /api/v1/savings/goals — list savings goals
router.get('/goals', authenticate, async (req: AuthRequest, res: Response) => {
  const goals = await savingsService.getGoals(req.userId!);
  res.json({ success: true, data: goals });
});

// POST /api/v1/savings/goals — create savings goal
const createGoalSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['EDUCATION', 'BUSINESS', 'HEALTH', 'EMERGENCY', 'FAMILY', 'CUSTOM']),
  target: z.number().min(100, 'Minimum target is ₦100'),
  targetDate: z.string().optional(),
});

router.post('/goals', authenticate, validate(createGoalSchema), async (req: AuthRequest, res: Response) => {
  const goal = await savingsService.createGoal(req.userId!, req.body);
  res.status(201).json({ success: true, data: goal });
});

// POST /api/v1/savings/goals/:id/deposit — deposit to goal
const depositSchema = z.object({
  amount: z.number().min(50, 'Minimum deposit is ₦50'),
});

router.post('/goals/:id/deposit', authenticate, validate(depositSchema), async (req: AuthRequest, res: Response) => {
  const result = await savingsService.deposit(req.userId!, req.params.id, req.body.amount);
  res.json({ success: true, data: result });
});

// POST /api/v1/savings/goals/:id/withdraw — withdraw from goal
const withdrawSchema = z.object({
  amount: z.number().min(50, 'Minimum withdrawal is ₦50'),
});

router.post('/goals/:id/withdraw', authenticate, validate(withdrawSchema), async (req: AuthRequest, res: Response) => {
  const result = await savingsService.withdraw(req.userId!, req.params.id, req.body.amount);
  res.json({ success: true, data: result });
});

// POST /api/v1/savings/autopay — enable AutoPay via Interswitch
const autoPaySchema = z.object({
  goalId: z.string().uuid(),
  amount: z.number().min(50, 'Minimum auto-save is ₦50'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']),
});

router.post('/autopay', authenticate, validate(autoPaySchema), async (req: AuthRequest, res: Response) => {
  const result = await savingsService.enableAutoPay(
    req.userId!, req.body.goalId, req.body.amount, req.body.frequency,
  );
  res.json({ success: true, data: result });
});

// DELETE /api/v1/savings/autopay/:goalId — cancel AutoPay
router.delete('/autopay/:goalId', authenticate, async (req: AuthRequest, res: Response) => {
  const result = await savingsService.cancelAutoPay(req.userId!, req.params.goalId);
  res.json({ success: true, data: result });
});

export default router;
