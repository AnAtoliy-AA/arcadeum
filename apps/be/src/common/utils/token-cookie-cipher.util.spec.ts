import {
  cookieCipherKey,
  decryptTokenCookie,
  encryptTokenCookie,
} from './token-cookie-cipher.util';

describe('token-cookie-cipher.util', () => {
  const key = cookieCipherKey('test-secret');

  it('round-trips a token through encrypt/decrypt', () => {
    const token = 'refresh-token-value';
    const encrypted = encryptTokenCookie(token, key);
    expect(encrypted).not.toContain(token);
    expect(decryptTokenCookie(encrypted, key)).toBe(token);
  });

  it('produces a different ciphertext for the same token each call', () => {
    const token = 'same-token';
    const a = encryptTokenCookie(token, key);
    const b = encryptTokenCookie(token, key);
    expect(a).not.toBe(b);
    expect(decryptTokenCookie(a, key)).toBe(token);
    expect(decryptTokenCookie(b, key)).toBe(token);
  });

  it('returns null for a token encrypted with a different key', () => {
    const otherKey = cookieCipherKey('other-secret');
    const encrypted = encryptTokenCookie('token', key);
    expect(decryptTokenCookie(encrypted, otherKey)).toBeNull();
  });

  it('returns null for tampered ciphertext', () => {
    const encrypted = encryptTokenCookie('token', key);
    const tampered =
      encrypted.slice(0, -2) + (encrypted.endsWith('AA') ? 'BB' : 'AA');
    expect(decryptTokenCookie(tampered, key)).toBeNull();
  });

  it('returns null for values that are not ciphertext (legacy cookies)', () => {
    expect(decryptTokenCookie('plain-jwt-value', key)).toBeNull();
    expect(decryptTokenCookie('', key)).toBeNull();
  });
});
