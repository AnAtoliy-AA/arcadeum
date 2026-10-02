import { getAllowedOrigins, corsOriginMatcher } from './cors.util';

describe('cors.util', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('getAllowedOrigins', () => {
    it('returns custom allowed origins from environment', () => {
      process.env.NODE_ENV = 'production';
      process.env.E2E = 'false';
      process.env.ALLOWED_ORIGINS =
        'https://arcadeum.games, https://api.arcadeum.games';

      const origins = getAllowedOrigins();
      expect(origins).toEqual([
        'https://arcadeum.games',
        'https://api.arcadeum.games',
      ]);
    });

    it('adds dev ports 3000, 3300, 3500 and WEB_PORT in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.WEB_PORT = '3000';
      process.env.ALLOWED_ORIGINS = 'https://arcadeum.games';

      const origins = getAllowedOrigins();
      expect(origins).toContain('http://localhost:3000');
      expect(origins).toContain('http://localhost:3300');
      expect(origins).toContain('http://localhost:3500');
      expect(origins).toContain('http://127.0.0.1:3500');
    });
  });

  describe('corsOriginMatcher', () => {
    it('allows undefined origin for server-to-server or curl requests', () => {
      let isAllowed = false;
      let errorResult: Error | null = null;

      corsOriginMatcher(undefined, (err, allow) => {
        errorResult = err;
        isAllowed = Boolean(allow);
      });

      expect(errorResult).toBeNull();
      expect(isAllowed).toBe(true);
    });

    it('allows localhost:3500 in development', () => {
      process.env.NODE_ENV = 'development';
      let isAllowed = false;
      let errorResult: Error | null = null;

      corsOriginMatcher('http://localhost:3500', (err, allow) => {
        errorResult = err;
        isAllowed = Boolean(allow);
      });

      expect(errorResult).toBeNull();
      expect(isAllowed).toBe(true);
    });

    it('rejects foreign origin in development', () => {
      process.env.NODE_ENV = 'development';
      let isAllowed = false;
      let errorResult: Error | null = null;

      corsOriginMatcher('https://evil.example.com', (err, allow) => {
        errorResult = err;
        isAllowed = Boolean(allow);
      });

      expect(errorResult).toBeInstanceOf(Error);
      expect(isAllowed).toBe(false);
    });
  });
});
