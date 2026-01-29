import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isSocketEncryptionEnabled,
  setEncryptionKey,
  hasEncryptionKey,
  resetEncryptionKey,
  encryptPayload,
  decryptPayload,
  maybeEncrypt,
  maybeDecrypt,
} from './socket-encryption';

describe('socket-encryption', () => {
  const VALID_KEY_HEX = '0'.repeat(64); // 32 bytes of zeros

  beforeEach(() => {
    resetEncryptionKey();
    vi.stubEnv('NEXT_PUBLIC_SOCKET_ENCRYPTION_ENABLED', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should check if encryption is enabled', () => {
    expect(isSocketEncryptionEnabled()).toBe(true);
    vi.stubEnv('NEXT_PUBLIC_SOCKET_ENCRYPTION_ENABLED', 'false');
    expect(isSocketEncryptionEnabled()).toBe(false);
  });

  it('should set valid encryption key', async () => {
    const result = await setEncryptionKey(VALID_KEY_HEX);
    expect(result).toBe(true);
    expect(hasEncryptionKey()).toBe(true);
  });

  it('should fail to set invalid encryption key (short)', async () => {
    const result = await setEncryptionKey('abc');
    expect(result).toBe(false);
  });

  it('should fail to set invalid encryption key (non-hex)', async () => {
    const result = await setEncryptionKey('x'.repeat(64));
    expect(result).toBe(false);
  });

  it('should encrypt and decrypt a payload', async () => {
    await setEncryptionKey(VALID_KEY_HEX);
    const payload = { message: 'hello' };

    const encrypted = await encryptPayload(payload);
    expect(typeof encrypted).toBe('string');

    const decrypted = await decryptPayload(encrypted);
    expect(decrypted).toEqual(payload);
  });

  it('encryptPayload throws error if key is not set', async () => {
    await expect(encryptPayload({ foo: 1 })).rejects.toThrow(
      'Encryption key not available',
    );
  });

  it('decryptPayload throws error if key is not set', async () => {
    await expect(decryptPayload('abc')).rejects.toThrow(
      'Encryption key not available',
    );
  });

  it('decryptPayload throws for too short payload', async () => {
    await setEncryptionKey(VALID_KEY_HEX);
    await expect(decryptPayload('abc')).rejects.toThrow('too short');
  });

  it('maybeEncrypt returns payload as-is if disabled or no key', async () => {
    const payload = { test: 1 };
    vi.stubEnv('NEXT_PUBLIC_SOCKET_ENCRYPTION_ENABLED', 'false');
    expect(await maybeEncrypt(payload)).toBe(payload);

    vi.stubEnv('NEXT_PUBLIC_SOCKET_ENCRYPTION_ENABLED', 'true');
    expect(await maybeEncrypt(payload)).toBe(payload); // No key yet
  });

  it('maybeDecrypt returns null and warns if received encrypted when disabled', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const payload = { __encrypted: 'some-data' };
    vi.stubEnv('NEXT_PUBLIC_SOCKET_ENCRYPTION_ENABLED', 'false');

    const result = await maybeDecrypt(payload);
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('maybeDecrypt returns null on decryption error', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await setEncryptionKey(VALID_KEY_HEX);
    const result = await maybeDecrypt({
      __encrypted: 'invalid-base-64-content!!',
    });
    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
