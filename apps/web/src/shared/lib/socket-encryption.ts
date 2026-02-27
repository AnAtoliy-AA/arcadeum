const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12;

/**
 * Encryption key received from server at runtime.
 * NOT bundled in client - fetched via socket on connect.
 */
let encryptionKeyBytes: Uint8Array | null = null;
let encryptionKeyImported: CryptoKey | null = null;

// Shared promise for waiting on the encryption key
let keyPromise: Promise<CryptoKey> | null = null;
let resolveKey: ((key: CryptoKey) => void) | null = null;
let rejectKey: ((reason: Error) => void) | null = null;

const KEY_WAIT_TIMEOUT_MS = 10000;

function getKeyPromise(): Promise<CryptoKey> {
  if (keyPromise) return keyPromise;
  keyPromise = new Promise((resolve, reject) => {
    resolveKey = resolve;
    rejectKey = reject;

    // Safety timeout to prevent infinite UI hangs
    setTimeout(() => {
      if (rejectKey) {
        rejectKey(new Error('Timeout waiting for encryption key'));
        resetEncryptionKey();
      }
    }, KEY_WAIT_TIMEOUT_MS);
  });
  return keyPromise;
}

/**
 * Check if socket encryption is enabled via environment variable.
 */
export function isSocketEncryptionEnabled(): boolean {
  const value = process.env.NEXT_PUBLIC_SOCKET_ENCRYPTION_ENABLED;
  return value === 'true' || value === '1';
}

/**
 * Check if encryption key has been received from server.
 */
export function hasEncryptionKey(): boolean {
  return encryptionKeyBytes !== null;
}

/**
 * Set the encryption key received from server.
 * Key is a 64-character hex string (32 bytes).
 */
export async function setEncryptionKey(keyHex: string): Promise<boolean> {
  if (!keyHex || keyHex.length !== 64) {
    return false;
  }

  try {
    // Convert hex string to bytes
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      const val = parseInt(keyHex.substring(i * 2, i * 2 + 2), 16);
      if (isNaN(val)) {
        throw new Error('Invalid hex character');
      }
      bytes[i] = val;
    }
    encryptionKeyBytes = bytes;

    // Import for Web Crypto API
    const importedKey = await crypto.subtle.importKey(
      'raw',
      bytes,
      { name: ALGORITHM },
      false,
      ['encrypt', 'decrypt'],
    );
    encryptionKeyImported = importedKey;

    // Resolve any waiting decryption calls
    if (resolveKey) {
      resolveKey(importedKey);
      resolveKey = null;
      rejectKey = null;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Reset encryption key (on disconnect).
 */
export function resetEncryptionKey(): void {
  encryptionKeyBytes = null;
  encryptionKeyImported = null;

  if (rejectKey) {
    rejectKey(new Error('Encryption key reset (disconnected)'));
  }

  keyPromise = null;
  resolveKey = null;
  rejectKey = null;
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
  const key = encryptionKeyImported || (await getKeyPromise());

  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const jsonString = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonString);

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
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
  const key = encryptionKeyImported || (await getKeyPromise());

  const combined = base64ToUint8Array(ciphertext);

  if (combined.length < IV_LENGTH + 16) {
    throw new Error('Invalid encrypted payload: too short');
  }

  const iv = combined.slice(0, IV_LENGTH);
  const encrypted = combined.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted,
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decrypted)) as T;
}

/**
 * Conditionally encrypt a payload based on environment settings.
 * Returns the original payload if encryption is disabled or key not available.
 */
export async function maybeEncrypt(payload: unknown): Promise<unknown> {
  if (!isSocketEncryptionEnabled() || !hasEncryptionKey()) {
    return payload;
  }
  return { __encrypted: await encryptPayload(payload) };
}

/**
 * Conditionally decrypt a payload based on environment settings.
 * Returns the original payload if encryption is disabled or payload is not encrypted.
 */
export async function maybeDecrypt<T = unknown>(payload: unknown): Promise<T> {
  const isEncrypted =
    typeof payload === 'object' &&
    payload !== null &&
    '__encrypted' in payload &&
    typeof (payload as Record<string, unknown>).__encrypted === 'string';

  if (!isSocketEncryptionEnabled()) {
    return (isEncrypted ? null : payload) as T;
  }

  if (isEncrypted) {
    try {
      return await decryptPayload<T>(
        (payload as Record<string, string>).__encrypted,
      );
    } catch (err) {
      console.error('[socket-encryption] Decryption failed:', err);
      return null as unknown as T;
    }
  }

  return payload as T;
}
