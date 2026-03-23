import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { quicktellerService } from '../services/payment/quickteller.service';
import { AuthRequest } from '../types';

const router = Router();

// GET /api/v1/transfers/banks — list supported banks
router.get('/banks', authenticate, async (_req: Request, res: Response) => {
  const banks = await quicktellerService.getBanks();
  res.json({ success: true, data: banks });
});

// POST /api/v1/transfers/name-enquiry — verify account before transfer
const nameEnquirySchema = z.object({
  bankCode: z.string().min(1),
  accountNumber: z.string().length(10, 'Account number must be 10 digits'),
});

router.post('/name-enquiry', authenticate, validate(nameEnquirySchema), async (req: Request, res: Response) => {
  const result = await quicktellerService.nameEnquiry(req.body.bankCode, req.body.accountNumber);
  res.json({ success: true, data: result });
});

// POST /api/v1/transfers/send — send money to bank account
const transferSchema = z.object({
  bankCode: z.string().min(1),
  accountNumber: z.string().length(10),
  amount: z.number().min(50, 'Minimum transfer is ₦50').max(5000000),
  recipientName: z.string().min(2).max(100),
  narration: z.string().max(100).optional(),
});

router.post('/send', authenticate, validate(transferSchema), async (req: AuthRequest, res: Response) => {
  const result = await quicktellerService.sendMoney(req.userId!, {
    ...req.body,
    reference: '', // Generated in service
  });
  res.json({ success: true, data: result });
});

export default router;
