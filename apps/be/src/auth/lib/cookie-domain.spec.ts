import { normalizeCookieDomain, resolveCookieDomain } from './cookie-domain';

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
