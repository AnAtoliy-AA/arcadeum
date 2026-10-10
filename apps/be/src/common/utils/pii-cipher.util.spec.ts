import { ConfigService } from '@nestjs/config';
import {
  encryptPii,
  decryptPii,
  hashPiiBlindIndex,
  resolvePiiEncryptionKey,
  resolvePiiIndexKey,
} from './pii-cipher.util';

describe('pii-cipher.util', () => {
  const secretKey = Buffer.alloc(32, 'a1b2c3d4e5f678901234567890abcdef');
  const indexKey = Buffer.alloc(32, 'fedcba098765432109876543210fedcb');

  describe('encryptPii & decryptPii', () => {
    it('encrypts and successfully decrypts string values', () => {
      const email = 'user@example.com';
      const ciphertext = encryptPii(email, secretKey);

      expect(ciphertext).toBeDefined();
      expect(ciphertext).not.toBe(email);

      const decrypted = decryptPii(ciphertext, secretKey);
      expect(decrypted).toBe(email);
    });

    it('produces different ciphertexts for identical inputs due to random IV', () => {
      const email = 'test@arcadeum.io';
      const cipher1 = encryptPii(email, secretKey);
      const cipher2 = encryptPii(email, secretKey);

      expect(cipher1).not.toBe(cipher2);
      expect(decryptPii(cipher1, secretKey)).toBe(email);
      expect(decryptPii(cipher2, secretKey)).toBe(email);
    });

    it('returns empty string when encrypting empty string', () => {
      expect(encryptPii('', secretKey)).toBe('');
    });

    it('returns null when decrypting empty string', () => {
      expect(decryptPii('', secretKey)).toBeNull();
    });

    it('returns null when decrypting tampered or invalid ciphertext', () => {
      expect(decryptPii('not-a-valid-base64', secretKey)).toBeNull();
      expect(
        decryptPii(Buffer.from('too-short').toString('base64'), secretKey),
      ).toBeNull();

      const validCipher = encryptPii('secret@example.com', secretKey);
      const tamperedBuffer = Buffer.from(validCipher, 'base64');
      tamperedBuffer[tamperedBuffer.length - 1] ^= 0x01;
      expect(
        decryptPii(tamperedBuffer.toString('base64'), secretKey),
      ).toBeNull();
    });

    it('fails to decrypt with a different key', () => {
      const otherKey = Buffer.alloc(32, '00000000000000000000000000000000');
      const cipher = encryptPii('data', secretKey);
      expect(decryptPii(cipher, otherKey)).toBeNull();
    });
  });

  describe('hashPiiBlindIndex', () => {
    it('produces deterministic hashes for exact lookups', () => {
      const hash1 = hashPiiBlindIndex('Alice@Domain.Com', indexKey);
      const hash2 = hashPiiBlindIndex('alice@domain.com', indexKey);
      const hash3 = hashPiiBlindIndex('  alice@domain.com  ', indexKey);

      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);
      expect(hash1).toHaveLength(64);
    });

    it('produces different hashes for different emails', () => {
      const hashA = hashPiiBlindIndex('a@example.com', indexKey);
      const hashB = hashPiiBlindIndex('b@example.com', indexKey);
      expect(hashA).not.toBe(hashB);
    });

    it('returns empty string for empty input', () => {
      expect(hashPiiBlindIndex('', indexKey)).toBe('');
      expect(hashPiiBlindIndex('   ', indexKey)).toBe('');
    });
  });

  describe('resolvePiiEncryptionKey & resolvePiiIndexKey', () => {
    it('resolves explicit PII_ENCRYPTION_KEY when set', () => {
      const config = {
        get: (k: string): string | undefined => {
          if (k === 'PII_ENCRYPTION_KEY')
            return 'my-custom-pii-secret-32-chars-long';
          return undefined;
        },
      } as unknown as ConfigService;

      const key = resolvePiiEncryptionKey(config);
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32);
    });

    it('derives key from AUTH_JWT_SECRET when explicit key is absent', () => {
      const config = {
        get: (k: string): string | undefined => {
          if (k === 'AUTH_JWT_SECRET') return 'test-jwt-secret';
          return undefined;
        },
      } as unknown as ConfigService;

      const key = resolvePiiEncryptionKey(config);
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32);
    });

    it('resolves deterministic index key', () => {
      const config = {
        get: (k: string): string | undefined => {
          if (k === 'AUTH_JWT_SECRET') return 'test-jwt-secret';
          return undefined;
        },
      } as unknown as ConfigService;

      const key = resolvePiiIndexKey(config);
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32);
    });
  });
});
