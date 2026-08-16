import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Derive a 32-byte AES-256 key from the JWT signing secret so cookie
 * encryption reuses the existing secret-management flow (ConfigService)
 * instead of introducing a second environment variable.
 */
export function cookieCipherKey(jwtSecret: string): Buffer {
  return createHash('sha256').update(jwtSecret).digest();
}

/**
 * Encrypt a token before storing it in a cookie. The token is never kept
 * in clear text — a compromised cookie (proxy logs, browser sync, disk
 * dump) only yields ciphertext.
 *
 * Format: base64( iv (12) || ciphertext || authTag (16) )
 */
export function encryptTokenCookie(value: string, key: Buffer): string {
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

/**
 * Decrypt a token stored by `encryptTokenCookie`. Returns null when the
 * value is not valid ciphertext (e.g. a pre-encryption cookie from before
 * deploy, or a tampered value) so callers can fall back gracefully.
 */
export function decryptTokenCookie(value: string, key: Buffer): string | null {
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
