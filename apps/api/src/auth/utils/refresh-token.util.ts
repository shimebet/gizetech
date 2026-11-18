import { randomBytes, randomUUID } from 'node:crypto';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SECRET_PATTERN = /^[0-9a-f]{64}$/;

export interface ParsedRefreshToken {
  sessionId: string;
  secret: string;
}

export function generateRefreshToken(): {
  sessionId: string;
  refreshToken: string;
} {
  const sessionId = randomUUID();
  const secret = randomBytes(32).toString('hex');

  const payload = `${sessionId}.${secret}`;

  return {
    sessionId,
    refreshToken: Buffer.from(payload, 'utf8').toString('base64url'),
  };
}

export function parseRefreshToken(
  refreshToken: string,
): ParsedRefreshToken | null {
  if (
    typeof refreshToken !== 'string' ||
    refreshToken.length < 40 ||
    refreshToken.length > 512 ||
    !/^[A-Za-z0-9_-]+$/.test(refreshToken)
  ) {
    return null;
  }

  try {
    const decoded = Buffer.from(
      refreshToken,
      'base64url',
    ).toString('utf8');

    const separator = decoded.indexOf('.');

    if (separator < 0) {
      return null;
    }

    const sessionId = decoded.slice(0, separator);
    const secret = decoded.slice(separator + 1);

    if (
      !UUID_PATTERN.test(sessionId) ||
      !SECRET_PATTERN.test(secret)
    ) {
      return null;
    }

    // Reject noncanonical encodings.
    if (
      Buffer.from(decoded, 'utf8').toString('base64url') !==
      refreshToken
    ) {
      return null;
    }

    return {
      sessionId,
      secret,
    };
  } catch {
    return null;
  }
}