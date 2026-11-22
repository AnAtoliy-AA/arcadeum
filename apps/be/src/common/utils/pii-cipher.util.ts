import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from 'node:crypto';
import { ConfigService } from '@nestjs/config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
let cachedDevEncryptionKey: Buffer | null = null;
let cachedDevIndexKey: Buffer | null = null;

export function resolvePiiEncryptionKey(config: ConfigService): Buffer {
  const configured = config.get<string>('PII_ENCRYPTION_KEY');
  if (configured && configured.trim().length > 0) {
    return createHash('sha256').update(configured.trim()).digest();
  }

  const jwtSecret = config.get<string>('AUTH_JWT_SECRET');
  if (jwtSecret && jwtSecret.trim().length > 0) {
    return createHash('sha256').update(`${jwtSecret.trim()}:pii-key`).digest();
  }

  const env = (
    config.get<string>('NODE_ENV') ??
    process.env.NODE_ENV ??
    ''
  ).toLowerCase();
  if (env === 'production') {
    throw new Error(
      'PII_ENCRYPTION_KEY or AUTH_JWT_SECRET must be configured in production',
    );
  }

  if (!cachedDevEncryptionKey) {
    cachedDevEncryptionKey = randomBytes(32);
  }
  return cachedDevEncryptionKey;
}

export function resolvePiiIndexKey(config: ConfigService): Buffer {
  const configured = config.get<string>('PII_INDEX_KEY');
  if (configured && configured.trim().length > 0) {
    return createHash('sha256').update(configured.trim()).digest();
  }

  const encKey = resolvePiiEncryptionKey(config);
  if (!cachedDevIndexKey) {
    cachedDevIndexKey = createHash('sha256')
      .update(Buffer.concat([encKey, Buffer.from(':index-salt', 'utf8')]))
      .digest();
  }
  return cachedDevIndexKey;
}

export function encryptPii(value: string, key: Buffer): string {
  if (!value) return '';
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const encrypted = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, encrypted, authTag]).toString('base64');
}

export function decryptPii(value: string, key: Buffer): string | null {
  if (!value) return null;
  try {
    const combined = Buffer.from(value, 'base64');
    if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) return null;
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(
      IV_LENGTH,
      combined.length - AUTH_TAG_LENGTH,
    );
    const decipher = createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    return null;
  }
}

export function hashPiiBlindIndex(value: string, key: Buffer): string {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return '';
  return createHmac('sha256', key).update(normalized).digest('hex');
}
