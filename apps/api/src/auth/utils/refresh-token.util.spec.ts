import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  generateRefreshToken,
  parseRefreshToken,
} from './refresh-token.util.js';

test('generates a valid refresh token', () => {
  const generated = generateRefreshToken();
  const parsed = parseRefreshToken(generated.refreshToken);

  assert.ok(parsed);
  assert.equal(parsed.sessionId, generated.sessionId);
  assert.match(parsed.secret, /^[0-9a-f]{64}$/);
});

test('generates unique refresh tokens', () => {
  const first = generateRefreshToken();
  const second = generateRefreshToken();

  assert.notEqual(first.sessionId, second.sessionId);
  assert.notEqual(first.refreshToken, second.refreshToken);
});

test('rejects empty refresh tokens', () => {
  assert.equal(parseRefreshToken(''), null);
});

test('rejects malformed refresh tokens', () => {
  assert.equal(parseRefreshToken('invalid-token'), null);
  assert.equal(parseRefreshToken('a'.repeat(600)), null);
  assert.equal(parseRefreshToken('!'.repeat(100)), null);
});

test('rejects invalid session identifiers', () => {
  const payload = Buffer.from(
    'invalid-session-id.' + 'a'.repeat(64),
    'utf8',
  ).toString('base64url');

  assert.equal(parseRefreshToken(payload), null);
});

test('rejects invalid token secrets', () => {
  const generated = generateRefreshToken();
  const parsed = parseRefreshToken(generated.refreshToken);

  assert.ok(parsed);

  const payload = Buffer.from(
    `${parsed.sessionId}.invalid-secret`,
    'utf8',
  ).toString('base64url');

  assert.equal(parseRefreshToken(payload), null);
});

test('rejects noncanonical base64url encoding', () => {
  const generated = generateRefreshToken();

  assert.equal(
    parseRefreshToken(generated.refreshToken + '='),
    null,
  );
});