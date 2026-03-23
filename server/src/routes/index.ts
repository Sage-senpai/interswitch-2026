import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import lessonRoutes from './lessons';
import savingsRoutes from './savings';
import paymentRoutes from './payments';
import transferRoutes from './transfers';
import wagRoutes from './wags';
import aiRoutes from './ai';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/wallet', userRoutes);
router.use('/lessons', lessonRoutes);
router.use('/savings', savingsRoutes);
router.use('/payments', paymentRoutes);
router.use('/transfers', transferRoutes);
router.use('/wags', wagRoutes);
router.use('/ai', aiRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

export default router;
