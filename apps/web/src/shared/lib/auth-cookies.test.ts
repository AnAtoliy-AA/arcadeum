import { describe, it, expect } from 'vitest';
import {
  findCookie,
  isNonProdArcadeumHost,
  resolveAuthCookieNames,
} from './auth-cookies';

describe('isNonProdArcadeumHost', () => {
  it('matches the backend classification', () => {
    expect(isNonProdArcadeumHost('api-dev.arcadeum.games')).toBe(true);
    expect(isNonProdArcadeumHost('staging.arcadeum.games')).toBe(true);
    expect(isNonProdArcadeumHost('api.arcadeum.games')).toBe(false);
    expect(isNonProdArcadeumHost('www.arcadeum.games')).toBe(false);
    expect(isNonProdArcadeumHost('arcadeum.games')).toBe(false);
    expect(isNonProdArcadeumHost('localhost')).toBe(false);
    expect(isNonProdArcadeumHost('evilarcadeum.games')).toBe(false);
  });
});

describe('resolveAuthCookieNames', () => {
  it('reads only dev_ cookies when the API is a non-prod host', () => {
    expect(resolveAuthCookieNames('https://api-dev.arcadeum.games')).toEqual({
      access: ['dev_access_token'],
      refresh: ['dev_refresh_token'],
    });
  });

  it('never reads dev_ cookies on prod or local builds', () => {
    for (const base of [
      'https://api.arcadeum.games',
      'http://localhost:4000',
      'not a url',
    ]) {
      const names = resolveAuthCookieNames(base);
      expect(names.access).toEqual(['access_token', 'web_access_token']);
      expect(names.refresh).toEqual(['refresh_token']);
    }
  });
});

describe('findCookie', () => {
  const jar = (values: Record<string, string>) => ({
    get: (n: string) => (n in values ? { value: values[n] } : undefined),
  });

  it('returns the first non-empty cookie in lookup order', () => {
    expect(
      findCookie(jar({ web_access_token: 'w', access_token: 'a' }), [
        'access_token',
        'web_access_token',
      ]),
    ).toEqual({ name: 'access_token', value: 'a' });
    expect(findCookie(jar({ access_token: '' }), ['access_token'])).toBeNull();
  });
});
