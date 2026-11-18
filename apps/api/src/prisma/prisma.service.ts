import 'dotenv/config';
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';

function createAdapter(): PrismaMariaDb {
  const value = process.env.DATABASE_URL;

  if (!value) {
    throw new Error('DATABASE_URL is not configured');
  }

  const url = new URL(value);

  if (url.protocol !== 'mysql:') {
    throw new Error('DATABASE_URL must use mysql://');
  }

  if (url.pathname !== '/gize_tech') {
    throw new Error('Unexpected database name');
  }

  return new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    connectionLimit: 5,
  });
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter: createAdapter(),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}