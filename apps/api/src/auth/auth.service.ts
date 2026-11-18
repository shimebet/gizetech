import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim().toLowerCase();

    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(
        'Email or username already registered',
      );
    }

    const passwordHash = await argon2.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          username,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          status: true,
          createdAt: true,
        },
      });

      return {
        message: 'Registration successful',
        user,
      };
    } catch (error: unknown) {
      if (
        error !== null &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Email or username already registered',
        );
      }

      throw error;
    }
  }

  async login(dto: LoginDto) {
    const identifier = dto.identifier.trim().toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const valid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );

    if (!valid) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new InternalServerErrorException(
        'Authentication configuration unavailable',
      );
    }

    const accessToken = await this.jwt.signAsync(
      {
        sub: user.id,
        username: user.username,
      },
      {
        secret,
        algorithm: 'HS256',
        expiresIn: 900,
      },
    );

    return {
      tokenType: 'Bearer',
      accessToken,
      expiresIn: 900,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
      },
    };
  }
}