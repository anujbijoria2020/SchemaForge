import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { ApiError } from '@/utils/ApiError';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication token missing or invalid');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email: string;
    };
    
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };
    
    next();
  } catch (error) {
    throw new ApiError(401, 'Authentication token invalid or expired');
  }
};
