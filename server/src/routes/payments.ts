import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { ipgService } from '../services/payment/ipg.service';
import { quicktellerService } from '../services/payment/quickteller.service';
import { AuthRequest } from '../types';

const router = Router();

// ─── Wallet Funding (IPG) ─────────────────────────────────

const fundSchema = z.object({
  amount: z.number().min(100, 'Minimum funding amount is ₦100').max(5000000),
});

// POST /api/v1/payments/fund — initiate wallet funding
router.post('/fund', authenticate, validate(fundSchema), async (req: AuthRequest, res: Response) => {
  const result = await ipgService.initiatePayment(req.userId!, req.body.amount);
  res.json({ success: true, data: result });
});

// POST /api/v1/payments/callback — Interswitch payment callback
router.post('/callback', async (req: Request, res: Response) => {
  const result = await ipgService.handleCallback(req.body);
  res.json({ success: true, data: result });
});

// GET /api/v1/payments/callback — Interswitch redirect callback (GET)
router.get('/callback', async (req: Request, res: Response) => {
  const result = await ipgService.handleCallback(req.query as any);
  // In production, redirect to mobile app deep link
  res.json({ success: true, data: result });
});

// GET /api/v1/payments/status/:reference — query payment status
router.get('/status/:reference', authenticate, async (req: Request, res: Response) => {
  const result = await ipgService.queryPaymentStatus(req.params.reference);
  res.json({ success: true, data: result });
});

// ─── Bill Payments (Quickteller) ──────────────────────────

// GET /api/v1/payments/billers/categories
router.get('/billers/categories', authenticate, async (_req: Request, res: Response) => {
  const categories = await quicktellerService.getBillerCategories();
  res.json({ success: true, data: categories });
});

// GET /api/v1/payments/billers?categoryId=xxx
router.get('/billers', authenticate, async (req: Request, res: Response) => {
  const categoryId = req.query.categoryId as string;
  const billers = await quicktellerService.getBillers(categoryId);
  res.json({ success: true, data: billers });
});

const billPaySchema = z.object({
  paymentCode: z.string().min(1),
  customerId: z.string().min(1),
  customerMobile: z.string().regex(/^(\+234|0)[789]\d{9}$/),
  amount: z.number().min(50).max(1000000),
});

// POST /api/v1/payments/bills — pay a bill
router.post('/bills', authenticate, validate(billPaySchema), async (req: AuthRequest, res: Response) => {
  const result = await quicktellerService.payBill(req.userId!, req.body);
  res.json({ success: true, data: result });
});

export default router;
