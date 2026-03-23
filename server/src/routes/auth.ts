import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { validate } from '../middleware/validate';

const router = Router();

const phoneSchema = z.object({
  phone: z.string().regex(/^(\+234|0)[789]\d{9}$/, 'Invalid Nigerian phone number'),
});

const registerSchema = phoneSchema.extend({
  name: z.string().min(2).max(100).optional(),
});

const verifySchema = phoneSchema.extend({
  code: z.string().length(6, 'OTP must be 6 digits'),
  name: z.string().min(2).max(100).optional(),
});

// POST /api/v1/auth/register
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  const result = await authService.register(req.body.phone, req.body.name);
  res.status(200).json({ success: true, data: result });
});

// POST /api/v1/auth/verify
router.post('/verify', validate(verifySchema), async (req: Request, res: Response) => {
  const result = await authService.verifyRegistration(req.body.phone, req.body.code, req.body.name);
  res.status(201).json({ success: true, data: result });
});

// POST /api/v1/auth/login
router.post('/login', validate(phoneSchema), async (req: Request, res: Response) => {
  const result = await authService.login(req.body.phone);
  res.status(200).json({ success: true, data: result });
});

// POST /api/v1/auth/verify-login
router.post('/verify-login', validate(verifySchema), async (req: Request, res: Response) => {
  const result = await authService.verifyLogin(req.body.phone, req.body.code);
  res.status(200).json({ success: true, data: result });
});

export default router;
