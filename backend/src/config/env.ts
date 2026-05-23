import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().min(1).default('postgres://postgres:postgres@localhost:5432/moscow_noivas'),
  JWT_SECRET: z.string().min(32).default('desenvolvimento-troque-este-segredo-local'),
  JWT_EXPIRES_IN_MINUTES: z.coerce.number().default(30),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(30),
  BCRYPT_COST: z.coerce.number().min(12).default(12),
  CORS_ORIGIN: z.string().default('http://localhost:5173')
});

export const env = envSchema.parse(process.env);
