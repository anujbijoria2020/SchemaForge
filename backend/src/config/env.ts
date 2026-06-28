import 'dotenv/config';
import path from 'path';
import fs from 'fs';

console.log('DEBUG: CWD is:', process.cwd());
const envPath = path.resolve(process.cwd(), '.env');
console.log('DEBUG: Expected .env path:', envPath);
console.log('DEBUG: Does .env exist?', fs.existsSync(envPath));
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  console.log('DEBUG: .env content lines:', content.split('\n').length);
  // Safely print keys found in .env (without printing values)
  const keys = content.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('=')[0]);
  console.log('DEBUG: Keys in .env:', keys);
}

import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  REDIS_URL: z.string({
    required_error: 'REDIS_URL is required',
  }).min(1, 'REDIS_URL cannot be empty'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  PORT: z.preprocess(
    (val) => (val === undefined || val === '' ? undefined : Number(val)),
    z.number().int().positive().default(4000)
  ),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
  BCRYPT_ROUNDS: z.preprocess(
    (val) => (val === undefined || val === '' ? undefined : Number(val)),
    z.number().int().positive().default(12)
  ),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Environment validation failed:');
  result.error.errors.forEach((err) => {
    console.error(`  - ${err.path.join('.')}: ${err.message}`);
  });
  throw new Error('Invalid environment configuration. Please check your environment variables.');
}

export const env = result.data;
export type Env = z.infer<typeof envSchema>;
