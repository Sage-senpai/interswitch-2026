import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Database
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRY: z.string().default('7d'),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(10),

  // Interswitch
  ISW_CLIENT_ID: z.string().min(1),
  ISW_SECRET_KEY: z.string().min(1),
  ISW_PASSPHRASE: z.string().optional(),
  ISW_BASE_URL: z.string().url().default('https://qa.interswitchng.com'),
  ISW_PAYMENT_URL: z.string().url().optional(),

  // AI
  OPENAI_API_KEY: z.string().optional(),

  // Blockchain
  POLYGON_RPC_URL: z.string().url().optional(),
  WALLET_PRIVATE_KEY: z.string().optional(),
  CONTRACT_SAVINGS_LEDGER: z.string().optional(),
  CONTRACT_WAG_POOL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
