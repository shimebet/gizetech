import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service.js';

interface AuthenticatedRequest {
  headers: {
    authorization?: string;
  };
  user?: {
    userId: string;
    username: string;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException(
        'Authentication required',
      );
    }

    const parts = authorization.split(' ');

    if (
      parts.length !== 2 ||
      parts[0] !== 'Bearer' ||
      !parts[1]
    ) {
      throw new UnauthorizedException(
        'Invalid authorization header',
      );
    }

    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new Error(
        'JWT_ACCESS_SECRET is not configured',
      );
    }

    let payload: {
      sub: string;
      username: string;
    };

    try {
      payload = await this.jwt.verifyAsync<{
        sub: string;
        username: string;
      }>(parts[1], {
        secret,
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired access token',
      );
    }

    if (
      !payload ||
      typeof payload.sub !== 'string' ||
      typeof payload.username !== 'string'
    ) {
      throw new UnauthorizedException(
        'Invalid access token payload',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        username: true,
        status: true,
      },
    });

    if (
      !user ||
      user.status !== 'ACTIVE' ||
      user.username !== payload.username
    ) {
      throw new UnauthorizedException(
        'Account unavailable',
      );
    }

    request.user = {
      userId: user.id,
      username: user.username,
    };

    return true;
  }
}