import {
  isNonProdArcadeumHost,
  normalizeCookieDomain,
  resolveCookieDomain,
  resolveCookieNames,
} from './cookie-domain';

const reqWith = (headers: Record<string, string>) => ({
  get: (name: string) => headers[name.toLowerCase()],
});

describe('resolveCookieDomain', () => {
  it('uses the Host header for arcadeum.games hosts', () => {
    expect(resolveCookieDomain(reqWith({ host: 'api.arcadeum.games' }))).toBe(
      '.arcadeum.games',
    );
  });

  it('prefers X-Forwarded-Host when the Host is an internal upstream', () => {
    expect(
      resolveCookieDomain(
        reqWith({
          host: 'be.internal:3000',
          'x-forwarded-host': 'arcadeum.games, proxy.local',
        }),
      ),
    ).toBe('.arcadeum.games');
  });

  it('honours the configured domain over headers', () => {
    expect(
      resolveCookieDomain(reqWith({ host: 'localhost:3000' }), '.Example.com'),
    ).toBe('.example.com');
  });

  it('ignores an invalid configured domain', () => {
    expect(
      resolveCookieDomain(reqWith({ host: 'localhost' }), 'bad domain;'),
    ).toBeUndefined();
  });

  it('returns undefined for unrelated or lookalike hosts', () => {
    expect(
      resolveCookieDomain(reqWith({ host: 'localhost:3000' })),
    ).toBeUndefined();
    expect(
      resolveCookieDomain(reqWith({ host: 'evilarcadeum.games' })),
    ).toBeUndefined();
  });
});

describe('normalizeCookieDomain', () => {
  it('rejects empty and single-label values', () => {
    expect(normalizeCookieDomain('')).toBeUndefined();
    expect(normalizeCookieDomain('localhost')).toBeUndefined();
  });
});

describe('non-prod hosts', () => {
  it('classifies hosts', () => {
    expect(isNonProdArcadeumHost('api-dev.arcadeum.games')).toBe(true);
    expect(isNonProdArcadeumHost('staging.arcadeum.games')).toBe(true);
    expect(isNonProdArcadeumHost('api.arcadeum.games')).toBe(false);
    expect(isNonProdArcadeumHost('www.arcadeum.games')).toBe(false);
    expect(isNonProdArcadeumHost('arcadeum.games')).toBe(false);
  });

  it('does not infer a domain-wide cookie for dev/staging hosts', () => {
    expect(
      resolveCookieDomain(reqWith({ host: 'api-dev.arcadeum.games' })),
    ).toBeUndefined();
    expect(
      resolveCookieDomain(
        reqWith({
          host: 'be:3000',
          'x-forwarded-host': 'staging.arcadeum.games',
        }),
      ),
    ).toBeUndefined();
  });

  it('still honours an explicit COOKIE_DOMAIN on dev hosts', () => {
    expect(
      resolveCookieDomain(
        reqWith({ host: 'api-dev.arcadeum.games' }),
        '.arcadeum.games',
      ),
    ).toBe('.arcadeum.games');
  });
});

describe('resolveCookieNames', () => {
  it('keeps plain names on prod and prefixes non-prod', () => {
    expect(resolveCookieNames(reqWith({ host: 'api.arcadeum.games' }))).toEqual(
      {
        access: 'access_token',
        refresh: 'refresh_token',
      },
    );
    expect(
      resolveCookieNames(reqWith({ host: 'api-dev.arcadeum.games' })),
    ).toEqual({ access: 'dev_access_token', refresh: 'dev_refresh_token' });
    expect(resolveCookieNames(reqWith({ host: 'localhost:3000' })).access).toBe(
      'access_token',
    );
  });
});
