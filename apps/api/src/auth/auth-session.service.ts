import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  generateRefreshToken,
  parseRefreshToken,
} from './utils/refresh-token.util.js';

const REFRESH_TOKEN_LIFETIME_MS =
  7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createSession(userId: string) {
    const generated = generateRefreshToken();

    const refreshTokenHash = await argon2.hash(
      generated.refreshToken,
    );

    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_LIFETIME_MS,
    );

    await this.prisma.authSession.create({
      data: {
        id: generated.sessionId,
        userId,
        refreshTokenHash,
        expiresAt,
      },
    });

    return {
      refreshToken: generated.refreshToken,
      refreshExpiresIn:
        REFRESH_TOKEN_LIFETIME_MS / 1000,
    };
  }

  async rotateSession(refreshToken: string) {
    const parsed = parseRefreshToken(refreshToken);

    if (!parsed) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    const session = await this.prisma.authSession.findUnique({
      where: {
        id: parsed.sessionId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            status: true,
          },
        },
      },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.user.status !== 'ACTIVE'
    ) {
      throw new UnauthorizedException(
        'Invalid or expired refresh token',
      );
    }

    const valid = await argon2.verify(
      session.refreshTokenHash,
      refreshToken,
    );

    if (!valid) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    const next = generateRefreshToken();
    const nextSecret = parseRefreshToken(next.refreshToken);

    if (!nextSecret) {
      throw new Error('Failed to generate refresh token');
    }

    // Keep the existing database session ID.
    const nextRefreshToken = Buffer.from(
      `${session.id}.${nextSecret.secret}`,
      'utf8',
    ).toString('base64url');

    // Hash the exact token that will be returned.
    const nextHash = await argon2.hash(
      nextRefreshToken,
    );

    const nextExpiry = new Date(
      Date.now() + REFRESH_TOKEN_LIFETIME_MS,
    );

    // Conditional update prevents two concurrent refreshes
    // from both successfully rotating the same token.
    const updated = await this.prisma.authSession.updateMany({
      where: {
        id: session.id,
        refreshTokenHash: session.refreshTokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        refreshTokenHash: nextHash,
        expiresAt: nextExpiry,
      },
    });

    if (updated.count !== 1) {
      throw new UnauthorizedException(
        'Refresh token already used or session unavailable',
      );
    }

    return {
      user: session.user,
      refreshToken: nextRefreshToken,
      refreshExpiresIn:
        REFRESH_TOKEN_LIFETIME_MS / 1000,
    };
  }

  async revokeSession(
    refreshToken: string,
    userId?: string,
  ) {
    const parsed = parseRefreshToken(refreshToken);

    if (!parsed) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    const session = await this.prisma.authSession.findUnique({
      where: {
        id: parsed.sessionId,
      },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      (userId && session.userId !== userId)
    ) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    const valid = await argon2.verify(
      session.refreshTokenHash,
      refreshToken,
    );

    if (!valid) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    const updated = await this.prisma.authSession.updateMany({
      where: {
        id: session.id,
        refreshTokenHash: session.refreshTokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    if (updated.count !== 1) {
      throw new UnauthorizedException(
        'Session already revoked or token rotated',
      );
    }

    return {
      message: 'Logout successful',
    };
  }
}