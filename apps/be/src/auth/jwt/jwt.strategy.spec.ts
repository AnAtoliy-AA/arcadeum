import {
  cookieCipherKey,
  encryptTokenCookie,
} from '../../common/utils/token-cookie-cipher.util';
import { extractJwtFromRequest } from './jwt.strategy';

describe('extractJwtFromRequest', () => {
  const key = cookieCipherKey('test-secret');
  const rawJwt = 'header.payload.signature';

  it('returns a plain JWT from the Authorization header as-is', () => {
    const result = extractJwtFromRequest(
      { headers: { authorization: `Bearer ${rawJwt}` } },
      key,
    );
    expect(result).toBe(rawJwt);
  });

  it('decrypts an encrypted cookie value sent as a Bearer token', () => {
    const encrypted = encryptTokenCookie(rawJwt, key);
    const result = extractJwtFromRequest(
      { headers: { authorization: `Bearer ${encrypted}` } },
      key,
    );
    expect(result).toBe(rawJwt);
  });

  it('decrypts an encrypted access_token cookie', () => {
    const encrypted = encryptTokenCookie(rawJwt, key);
    const result = extractJwtFromRequest(
      { headers: {}, cookies: { access_token: encrypted } },
      key,
    );
    expect(result).toBe(rawJwt);
  });

  it('accepts a legacy plain access_token cookie', () => {
    const result = extractJwtFromRequest(
      { headers: {}, cookies: { access_token: rawJwt } },
      key,
    );
    expect(result).toBe(rawJwt);
  });

  it('returns null when no Authorization header or cookie is present', () => {
    const result = extractJwtFromRequest({ headers: {} }, key);
    expect(result).toBeNull();
  });

  it('returns an empty string for an empty Bearer token', () => {
    const result = extractJwtFromRequest(
      { headers: { authorization: 'Bearer ' } },
      key,
    );
    expect(result).toBe('');
  });

  it('falls back to the raw value when decryption fails (tampered ciphertext)', () => {
    const encrypted = encryptTokenCookie(rawJwt, key);
    const tampered =
      encrypted.slice(0, -2) + (encrypted.endsWith('AA') ? 'BB' : 'AA');
    const result = extractJwtFromRequest(
      { headers: { authorization: `Bearer ${tampered}` } },
      key,
    );
    expect(result).toBe(tampered);
  });
});
