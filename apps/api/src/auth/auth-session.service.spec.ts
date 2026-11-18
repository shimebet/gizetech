import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as argon2 from 'argon2';
import { AuthSessionService } from './auth-session.service.js';
import { parseRefreshToken } from './utils/refresh-token.util.js';
import type { PrismaService } from '../prisma/prisma.service.js';

type SessionRecord = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  user: {
    id: string;
    username: string;
    status: 'ACTIVE' | 'SUSPENDED';
  };
};

function createFixture() {
  const records = new Map<string, SessionRecord>();

  const user = {
    id: 'test-user-id',
    username: 'testuser',
    status: 'ACTIVE' as const,
  };

  const prismaMock = {
    authSession: {
      create: async ({ data }: {
        data: {
          id: string;
          userId: string;
          refreshTokenHash: string;
          expiresAt: Date;
        };
      }) => {
        const record: SessionRecord = {
          ...data,
          revokedAt: null,
          user,
        };

        records.set(record.id, record);
        return record;
      },

      findUnique: async ({ where }: {
        where: { id: string };
      }) => {
        const record = records.get(where.id);

        if (!record) {
          return null;
        }

        // Simulate Prisma returning an independent result object.
        // Do not expose the mutable in-memory database record.
        return {
          ...record,
          user: { ...record.user },
        };
      },

      updateMany: async ({ where, data }: {
        where: {
          id: string;
          refreshTokenHash: string;
          revokedAt: null;
          expiresAt?: { gt: Date };
        };
        data: {
          refreshTokenHash?: string;
          expiresAt?: Date;
          revokedAt?: Date;
        };
      }) => {
        const record = records.get(where.id);

        if (
          !record ||
          record.revokedAt !== null ||
          record.refreshTokenHash !== where.refreshTokenHash ||
          (where.expiresAt &&
            record.expiresAt <= where.expiresAt.gt)
        ) {
          return { count: 0 };
        }

        if (data.refreshTokenHash) {
          record.refreshTokenHash = data.refreshTokenHash;
        }

        if (data.expiresAt) {
          record.expiresAt = data.expiresAt;
        }

        if (data.revokedAt) {
          record.revokedAt = data.revokedAt;
        }

        return { count: 1 };
      },
    },
  };

  const service = new AuthSessionService(
    prismaMock as unknown as PrismaService,
  );

  return { service, records, user };
}

test('creates a hashed refresh session', async () => {
  const { service, records, user } = createFixture();

  const result = await service.createSession(user.id);
  const parsed = parseRefreshToken(result.refreshToken);

  assert.ok(parsed);

  const record = records.get(parsed.sessionId);

  assert.ok(record);
  assert.equal(record.userId, user.id);
  assert.notEqual(
    record.refreshTokenHash,
    result.refreshToken,
  );

  assert.equal(
    await argon2.verify(
      record.refreshTokenHash,
      result.refreshToken,
    ),
    true,
  );
});

test('rotates token and preserves session ID', async () => {
  const { service, user } = createFixture();

  const initial = await service.createSession(user.id);
  const rotated = await service.rotateSession(
    initial.refreshToken,
  );

  const before = parseRefreshToken(initial.refreshToken);
  const after = parseRefreshToken(rotated.refreshToken);

  assert.ok(before);
  assert.ok(after);

  assert.equal(before.sessionId, after.sessionId);
  assert.notEqual(
    initial.refreshToken,
    rotated.refreshToken,
  );
});

test('supports consecutive token rotations', async () => {
  const { service, user } = createFixture();

  const first = await service.createSession(user.id);
  const second = await service.rotateSession(
    first.refreshToken,
  );
  const third = await service.rotateSession(
    second.refreshToken,
  );

  assert.notEqual(
    second.refreshToken,
    third.refreshToken,
  );
});

test('rejects previously rotated tokens', async () => {
  const { service, user } = createFixture();

  const first = await service.createSession(user.id);

  await service.rotateSession(first.refreshToken);

  await assert.rejects(
    service.rotateSession(first.refreshToken),
    { status: 401 },
  );
});

test('rejects malformed refresh tokens', async () => {
  const { service } = createFixture();

  await assert.rejects(
    service.rotateSession('invalid'),
    { status: 401 },
  );
});

test('rejects inactive users', async () => {
  const { service, records, user } = createFixture();

  const initial = await service.createSession(user.id);
  const parsed = parseRefreshToken(initial.refreshToken);

  assert.ok(parsed);

  const record = records.get(parsed.sessionId);

  assert.ok(record);

  record.user.status = 'SUSPENDED';

  await assert.rejects(
    service.rotateSession(initial.refreshToken),
    { status: 401 },
  );
});

test('only one concurrent rotation succeeds', async () => {
  const { service, user } = createFixture();

  const initial = await service.createSession(user.id);

  const results = await Promise.allSettled([
    service.rotateSession(initial.refreshToken),
    service.rotateSession(initial.refreshToken),
  ]);

  const successful = results.filter(
    (result) => result.status === 'fulfilled',
  );

  const rejected = results.filter(
    (result) => result.status === 'rejected',
  );

  assert.equal(successful.length, 1);
  assert.equal(rejected.length, 1);
});

test('logout revokes the session', async () => {
  const { service, records, user } = createFixture();

  const initial = await service.createSession(user.id);
  const parsed = parseRefreshToken(initial.refreshToken);

  assert.ok(parsed);

  const result = await service.revokeSession(
    initial.refreshToken,
  );

  assert.equal(result.message, 'Logout successful');

  const record = records.get(parsed.sessionId);

  assert.ok(record);
  assert.ok(record.revokedAt);

  await assert.rejects(
    service.rotateSession(initial.refreshToken),
    { status: 401 },
  );
});

test('rejects repeated logout', async () => {
  const { service, user } = createFixture();

  const initial = await service.createSession(user.id);

  await service.revokeSession(initial.refreshToken);

  await assert.rejects(
    service.revokeSession(initial.refreshToken),
    { status: 401 },
  );
});