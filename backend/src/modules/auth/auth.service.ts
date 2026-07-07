import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { redis } from '@/config/redis';
import { ApiError } from '@/utils/ApiError';
import { AuthRepository } from './auth.repository';
import { RegisterDto, LoginDto } from './auth.dto';
import { User } from '@prisma/client';

export class AuthService {
  private authRepository = new AuthRepository();

  private generateAccessToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, env.JWT_SECRET, {
      expiresIn: '15m',
    });
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });
  }

  private omitPassword(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async register(data: RegisterDto) {
    const existingUser = await this.authRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);

    const user = await this.authRepository.create({
      email: data.email,
      displayName: data.displayName,
      passwordHash,
      authProvider: 'local',
    });

    await this.authRepository.updateLastLogin(user.id);

    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: this.omitPassword(user),
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginDto) {
    const user = await this.authRepository.findByEmail(data.email);
    if (!user || !user.passwordHash) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    await this.authRepository.updateLastLogin(user.id);

    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: this.omitPassword(user),
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    try {
      // (1) Verify refresh token JWT
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };

      // Redis Key Pattern: schemaforge:rt:blacklist:<token>
      const blacklistKey = `schemaforge:rt:blacklist:${token}`;

      // (2) Check it is NOT in Redis blacklist
      const isBlacklisted = await redis.exists(blacklistKey);
      if (isBlacklisted) {
        throw new ApiError(401, 'Refresh token has been revoked');
      }

      const user = await this.authRepository.findById(decoded.userId);
      if (!user) {
        throw new ApiError(401, 'User not found');
      }

      // (3) Add old token to blacklist with TTL = 7 days (604,800 seconds)
      await redis.set(blacklistKey, '1', 'EX', 7 * 24 * 60 * 60);

      // (4) Issue new access + refresh tokens
      const accessToken = this.generateAccessToken(user.id, user.email);
      const newRefreshToken = this.generateRefreshToken(user.id);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return this.omitPassword(user);
  }
}
