import {
  generateUserDek,
  encryptUserDek,
  decryptUserDek,
  encryptWithUserDek,
  decryptWithUserDek,
  wipeBuffer,
  parseVersionedCiphertext,
} from './envelope-cipher.util';

describe('envelope-cipher.util', () => {
  const masterKekV1 = Buffer.alloc(32, '0123456789abcdef0123456789abcdef');
  const masterKekV2 = Buffer.alloc(32, 'fedcba9876543210fedcba9876543210');

  describe('generateUserDek', () => {
    it('generates a 32-byte cryptographically random buffer', () => {
      const dek1 = generateUserDek();
      const dek2 = generateUserDek();

      expect(dek1).toBeInstanceOf(Buffer);
      expect(dek1.length).toBe(32);
      expect(dek2.length).toBe(32);
      expect(dek1.equals(dek2)).toBe(false);
    });
  });

  describe('key versioning', () => {
    it('prefixes ciphertexts with version indicator', () => {
      const dek = generateUserDek();
      const encryptedDek = encryptUserDek(dek, masterKekV1);
      expect(encryptedDek.startsWith('v1$')).toBe(true);

      const parsed = parseVersionedCiphertext(encryptedDek);
      expect(parsed.version).toBe('v1');
      expect(parsed.payload.length).toBeGreaterThan(0);
    });

    it('supports rotating keys via key map', () => {
      const dek1 = generateUserDek();
      const dek2 = generateUserDek();

      const cipherV1 = encryptUserDek(dek1, masterKekV1, 'v1');
      const cipherV2 = encryptUserDek(dek2, masterKekV2, 'v2');

      const keyMap: Record<string, Buffer> = {
        v1: masterKekV1,
        v2: masterKekV2,
      };

      const decrypted1 = decryptUserDek(cipherV1, keyMap);
      const decrypted2 = decryptUserDek(cipherV2, keyMap);

      expect(decrypted1?.equals(dek1)).toBe(true);
      expect(decrypted2?.equals(dek2)).toBe(true);
    });

    it('falls back to default version for unversioned legacy ciphertexts', () => {
      const unversioned = 'legacyPayloadWithoutDollar';
      const parsed = parseVersionedCiphertext(unversioned);
      expect(parsed.version).toBe('v1');
      expect(parsed.payload).toBe(unversioned);
    });
  });

  describe('encryptUserDek & decryptUserDek', () => {
    it('encrypts DEK with master KEK and correctly decrypts it', () => {
      const dek = generateUserDek();
      const encryptedDek = encryptUserDek(dek, masterKekV1);

      const decryptedDek = decryptUserDek(encryptedDek, masterKekV1);
      expect(decryptedDek).not.toBeNull();
      expect(decryptedDek?.equals(dek)).toBe(true);
    });

    it('returns null on tampered or corrupted encrypted DEK', () => {
      const dek = generateUserDek();
      const encryptedDek = encryptUserDek(dek, masterKekV1);
      const parts = encryptedDek.split('$');
      const payloadBuf = Buffer.from(parts[1] ?? '', 'base64');
      payloadBuf[payloadBuf.length - 1] ^= 0x01;

      const tampered = `${parts[0] ?? 'v1'}$${payloadBuf.toString('base64')}`;
      const result = decryptUserDek(tampered, masterKekV1);
      expect(result).toBeNull();
    });

    it('returns null when encrypted DEK string is empty', () => {
      expect(decryptUserDek('', masterKekV1)).toBeNull();
    });
  });

  describe('encryptWithUserDek & decryptWithUserDek', () => {
    it('encrypts and decrypts user PII using their personal DEK', () => {
      const dek = generateUserDek();
      const secret = 'user-confidential-email@arcadeum.io';

      const cipher = encryptWithUserDek(secret, dek);
      expect(cipher.startsWith('v1$')).toBe(true);

      const decrypted = decryptWithUserDek(cipher, dek);
      expect(decrypted).toBe(secret);
    });

    it('fails to decrypt if wrong DEK is provided', () => {
      const dek1 = generateUserDek();
      const dek2 = generateUserDek();
      const secret = 'my-secret-pii';

      const cipher = encryptWithUserDek(secret, dek1);
      const decrypted = decryptWithUserDek(cipher, dek2);
      expect(decrypted).toBeNull();
    });

    it('handles empty inputs safely', () => {
      const dek = generateUserDek();
      expect(encryptWithUserDek('', dek)).toBe('');
      expect(decryptWithUserDek('', dek)).toBeNull();
    });
  });

  describe('wipeBuffer', () => {
    it('zeroes out buffer contents to prevent memory retention', () => {
      const sensitiveBuf = Buffer.from('ultra-confidential-secret-key-32');
      expect(sensitiveBuf.some((byte) => byte !== 0)).toBe(true);

      wipeBuffer(sensitiveBuf);
      expect(sensitiveBuf.every((byte) => byte === 0)).toBe(true);
    });
  });
});
