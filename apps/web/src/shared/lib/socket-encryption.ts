const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12;

/**
 * Check if socket encryption is enabled via environment variable.
 */
export function isSocketEncryptionEnabled(): boolean {
  const value = process.env.NEXT_PUBLIC_SOCKET_ENCRYPTION_ENABLED;
  return value === 'true' || value === '1';
}

/**
 * Get the encryption key from environment.
 * Key must be 64 hex characters (32 bytes).
 */
function getEncryptionKey(): Uint8Array<ArrayBuffer> {
  const keyHex = process.env.NEXT_PUBLIC_SOCKET_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error(
      'NEXT_PUBLIC_SOCKET_ENCRYPTION_KEY must be set to a 64-character hex string (32 bytes)',
    );
  }
  const buffer = new ArrayBuffer(32);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(keyHex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to Base64 string.
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to Uint8Array.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypt a payload object using AES-256-GCM.
 * Returns a Base64-encoded string containing IV + ciphertext + auth tag.
 */
export async function encryptPayload(payload: unknown): Promise<string> {
  const key = getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const jsonString = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonString);

  // Import key for Web Crypto API
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: ALGORITHM },
    false,
    ['encrypt'],
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    cryptoKey,
    data,
  );

  // Combine IV + ciphertext (Web Crypto appends auth tag automatically)
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return uint8ArrayToBase64(combined);
}

/**
 * Decrypt a Base64-encoded encrypted payload.
 * Returns the original object.
 */
export async function decryptPayload<T = unknown>(
  ciphertext: string,
): Promise<T> {
  const key = getEncryptionKey();
  const combined = base64ToUint8Array(ciphertext);

  if (combined.length < IV_LENGTH + 16) {
    throw new Error('Invalid encrypted payload: too short');
  }

  const iv = combined.slice(0, IV_LENGTH);
  const encrypted = combined.slice(IV_LENGTH);

  // Import key for Web Crypto API
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: ALGORITHM },
    false,
    ['decrypt'],
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    cryptoKey,
    encrypted,
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decrypted)) as T;
}

/**
 * Conditionally encrypt a payload based on environment settings.
 * Returns the original payload if encryption is disabled.
 */
export async function maybeEncrypt(payload: unknown): Promise<unknown> {
  if (!isSocketEncryptionEnabled()) {
    return payload;
  }
  return { __encrypted: await encryptPayload(payload) };
}

/**
 * Conditionally decrypt a payload based on environment settings.
 * Returns the original payload if encryption is disabled or payload is not encrypted.
 */
export async function maybeDecrypt<T = unknown>(payload: unknown): Promise<T> {
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
