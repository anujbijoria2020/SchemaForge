import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env } from './env';

// We cast globalThis to include the cached prisma instance and pg pool.
// In development, hot module reloading (HMR) re-evaluates modules on change.
// If we created a new PrismaClient and Pool on every reload, we would quickly exhaust 
// the database connection pool. Storing the instances on globalThis (which persists
// across reloads in Node.js) ensures that we reuse the same client and pool instances.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const isDev = env.NODE_ENV === 'development';

const pool = globalForPrisma.pool ?? new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: isDev ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

export default prisma;

