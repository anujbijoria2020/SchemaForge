import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from './auth.dto';
import { env } from '@/config/env';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';
import { successResponse, createdResponse, noContentResponse } from '@/utils/response';

const authService = new AuthService();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body);
  const result = await authService.register(validatedData);

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

  return createdResponse(res, {
    user: result.user,
    accessToken: result.accessToken,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);
  const result = await authService.login(validatedData);

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

  return successResponse(res, {
    user: result.user,
    accessToken: result.accessToken,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) {
    throw new ApiError(401, 'Refresh token is missing');
  }

  const result = await authService.refresh(token);

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

  return successResponse(res, {
    accessToken: result.accessToken,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return noContentResponse(res);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const user = await authService.getMe(userId);

  return successResponse(res, { user });
});
