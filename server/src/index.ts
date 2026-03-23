import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.NODE_ENV === 'production'
    ? ['https://purse-app.vercel.app']
    : ['http://localhost:8081', 'http://localhost:19006', 'http://localhost:3001'],
  credentials: true,
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'production' ? 100 : 1000,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', routes);

// Root
app.get('/', (_req, res) => {
  res.json({
    name: 'Purse API',
    version: '1.0.0',
    description: 'AI-powered financial literacy & empowerment for Nigerian women',
    docs: '/api/v1/health',
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function start() {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`\n  Purse API running on http://localhost:${env.PORT}`);
    console.log(`  Environment: ${env.NODE_ENV}`);
    console.log(`  Interswitch: ${env.ISW_BASE_URL}\n`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});
