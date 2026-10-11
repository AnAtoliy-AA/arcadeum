import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const DEK_LENGTH = 32;
export const DEFAULT_KEY_VERSION = 'v1';

export function wipeBuffer(buf: Buffer): void {
  buf.fill(0);
}

export function generateUserDek(): Buffer {
  return randomBytes(DEK_LENGTH);
}

export function parseVersionedCiphertext(raw: string): {
  version: string;
  payload: string;
} {
  if (raw.startsWith('v') && raw.includes('$')) {
    const separatorIndex = raw.indexOf('$');
    return {
      version: raw.substring(0, separatorIndex),
      payload: raw.substring(separatorIndex + 1),
    };
  }
  return {
    version: DEFAULT_KEY_VERSION,
    payload: raw,
  };
}

export function encryptUserDek(
  dek: Buffer,
  masterKek: Buffer,
  keyVersion = DEFAULT_KEY_VERSION,
): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, masterKek, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const encrypted = Buffer.concat([cipher.update(dek), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, encrypted, authTag]).toString('base64');
  return `${keyVersion}$${payload}`;
}

export function decryptUserDek(
  encryptedDek: string,
  masterKekOrMap: Buffer | Record<string, Buffer>,
): Buffer | null {
  if (!encryptedDek) return null;
  try {
    const { version, payload } = parseVersionedCiphertext(encryptedDek);
    const key = Buffer.isBuffer(masterKekOrMap)
      ? masterKekOrMap
      : (masterKekOrMap[version] ?? masterKekOrMap[DEFAULT_KEY_VERSION]);
    if (!key) return null;

    const combined = Buffer.from(payload, 'base64');
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
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  } catch {
    return null;
  }
}

export function encryptWithUserDek(
  plaintext: string,
  dek: Buffer,
  version = DEFAULT_KEY_VERSION,
): string {
  if (!plaintext) return '';
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, dek, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, encrypted, authTag]).toString('base64');
  return `${version}$${payload}`;
}

export function decryptWithUserDek(
  ciphertext: string,
  dek: Buffer,
): string | null {
  if (!ciphertext) return null;
  try {
    const { payload } = parseVersionedCiphertext(ciphertext);
    const combined = Buffer.from(payload, 'base64');
    if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) return null;
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(
      IV_LENGTH,
      combined.length - AUTH_TAG_LENGTH,
    );
    const decipher = createDecipheriv(ALGORITHM, dek, iv, {
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
