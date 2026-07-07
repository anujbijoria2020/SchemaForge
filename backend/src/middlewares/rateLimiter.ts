import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import redis from '@/config/redis';

// 1. Global Limiter: 100 req / 15 minutes per IP
const globalRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'ratelimit_global',
  points: 100,
  duration: 15 * 60, // 15 minutes (900 seconds)
});

// 2. Auth Limiter: 5 req / 15 minutes per IP (for /auth/login and /auth/register)
const authRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'ratelimit_auth',
  points: 5,
  duration: 15 * 60, // 15 minutes (900 seconds)
});

// 3. User Limiter: 500 req / 15 minutes per userId (for authenticated routes)
const userRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'ratelimit_user',
  points: 500,
  duration: 15 * 60, // 15 minutes (900 seconds)
});

/**
 * Middleware for global rate limiting (IP-based).
 */
export const globalLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'anonymous';
  try {
    await globalRateLimiter.consume(ip);
    next();
  } catch (rejRes: any) {
    if (rejRes instanceof Error) {
      // Log connection/store issues and fail open to prevent complete app outage
      console.error('[RateLimiter] Global rate limiter store error:', rejRes);
      return next();
    }
    const retryAfter = Math.ceil((rejRes.msBeforeNext || 0) / 1000);
    res.setHeader('Retry-After', retryAfter.toString());
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter,
    });
  }
};

/**
 * Middleware for auth rate limiting (IP-based, login/register).
 */
export const authLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'anonymous';
  try {
    await authRateLimiter.consume(ip);
    next();
  } catch (rejRes: any) {
    if (rejRes instanceof Error) {
      console.error('[RateLimiter] Auth rate limiter store error:', rejRes);
      return next();
    }
    const retryAfter = Math.ceil((rejRes.msBeforeNext || 0) / 1000);
    res.setHeader('Retry-After', retryAfter.toString());
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter,
    });
  }
};

/**
 * Middleware for user rate limiting (UserId-based, authenticated routes).
 */
export const userLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) {
    // If route doesn't have req.user, skip user-based rate limiting
    return next();
  }

  try {
    await userRateLimiter.consume(userId);
    next();
  } catch (rejRes: any) {
    if (rejRes instanceof Error) {
      console.error('[RateLimiter] User rate limiter store error:', rejRes);
      return next();
    }
    const retryAfter = Math.ceil((rejRes.msBeforeNext || 0) / 1000);
    res.setHeader('Retry-After', retryAfter.toString());
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter,
    });
  }
};
