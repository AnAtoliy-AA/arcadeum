import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Check if socket encryption is enabled via environment variable.
 */
export function isSocketEncryptionEnabled(): boolean {
  const value = process.env.SOCKET_ENCRYPTION_ENABLED;
  return value === 'true' || value === '1';
}

/**
 * Get the encryption key from environment.
 * Key must be 64 hex characters (32 bytes).
 */
function getEncryptionKey(): Buffer {
  const keyHex = process.env.SOCKET_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error(
      'SOCKET_ENCRYPTION_KEY must be set to a 64-character hex string (32 bytes)',
    );
  }
  return Buffer.from(keyHex, 'hex');
}

/**
 * Encrypt a payload object using AES-256-GCM.
 * Returns a Base64-encoded string containing IV + ciphertext + auth tag.
 */
export function encryptPayload(payload: unknown): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const jsonString = JSON.stringify(payload);
  const encrypted = Buffer.concat([
    cipher.update(jsonString, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Format: IV (12 bytes) + ciphertext + authTag (16 bytes)
  const combined = Buffer.concat([iv, encrypted, authTag]);
  return combined.toString('base64');
}

/**
 * Decrypt a Base64-encoded encrypted payload.
 * Returns the original object.
 */
export function decryptPayload<T = unknown>(ciphertext: string): T {
  const key = getEncryptionKey();
  const combined = Buffer.from(ciphertext, 'base64');

  if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Invalid encrypted payload: too short');
  }

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

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString('utf8')) as T;
}

/**
 * Conditionally encrypt a payload based on environment settings.
 * Returns the original payload if encryption is disabled.
 */
export function maybeEncrypt(payload: unknown): unknown {
  if (!isSocketEncryptionEnabled()) {
    return payload;
  }
  return { __encrypted: encryptPayload(payload) };
}

/**
 * Conditionally decrypt a payload based on environment settings.
 * Returns the original payload if encryption is disabled or payload is not encrypted.
 */
export function maybeDecrypt<T = unknown>(payload: unknown): T {
  if (!isSocketEncryptionEnabled()) {
    return payload as T;
  }

  if (
    typeof payload === 'object' &&
    payload !== null &&
    '__encrypted' in payload &&
    typeof (payload as Record<string, unknown>).__encrypted === 'string'
  ) {
    return decryptPayload<T>((payload as Record<string, string>).__encrypted);
  }

  return payload as T;
}
