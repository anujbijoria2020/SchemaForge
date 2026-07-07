import Redis from 'ioredis';
import { env } from './env';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

/**
 * Creates and configures a Redis client instance.
 * Gracefully handles connection status logs, retries, and errors.
 */
const createRedisClient = (): Redis => {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    // Attempt reconnection with exponential backoff up to 3 seconds max delay
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = 'READONLY';
      if (err.message.slice(0, targetError.length) === targetError) {
        return true; // Reconnect on READONLY error
      }
      return false;
    },
  });

  // Logging Connection Events
  client.on('connect', () => {
    console.log('🔌 Redis connecting...');
  });

  client.on('ready', () => {
    console.log('✅ Redis client ready and connected successfully');
  });

  client.on('error', (error) => {
    console.error('❌ Redis client connection error:', error.message || error);
  });

  client.on('close', () => {
    console.warn('⚠️ Redis connection closed');
  });

  client.on('reconnecting', (delay: number) => {
    console.log(`🔄 Redis client reconnecting in ${delay}ms...`);
  });

  return client;
};

// Singleton instance to prevent connection exhaustion in hot-reloading development environments
export const redis = globalForRedis.redis ?? createRedisClient();

if (env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export default redis;
export type RedisClient = Redis;
