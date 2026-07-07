import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/ApiError';
import { env } from '@/config/env';
import { errorResponse } from '@/utils/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Error) {
    message = err.message;
  }

  const stack = env.NODE_ENV === 'development' ? err.stack : undefined;
  errorResponse(res, message, statusCode, errors, stack);
};
