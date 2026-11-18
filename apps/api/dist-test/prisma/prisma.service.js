var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import 'dotenv/config';
import { Injectable, } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';
function createAdapter() {
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
let PrismaService = class PrismaService extends PrismaClient {
    constructor() {
        super({
            adapter: createAdapter(),
        });
    }
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
PrismaService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], PrismaService);
export { PrismaService };
//# sourceMappingURL=prisma.service.js.map