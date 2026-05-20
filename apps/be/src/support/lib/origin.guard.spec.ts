import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { OriginGuard } from './origin.guard';

function buildCtx(
  headers: Record<string, string | undefined>,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  } as unknown as ExecutionContext;
}

describe('OriginGuard', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: 'development',
      WEB_PORT: '3000',
      ALLOWED_ORIGINS: 'https://arcadeum.games',
      SUPPORT_INTERNAL_TOKEN: 'shared-secret-xyz',
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  let guard: OriginGuard;
  beforeEach(() => {
    guard = new OriginGuard();
  });

  it('allows requests whose Origin matches an allowed value', () => {
    expect(
      guard.canActivate(buildCtx({ origin: 'http://localhost:3000' })),
    ).toBe(true);
  });

  it('allows requests whose Referer starts with an allowed origin', () => {
    expect(
      guard.canActivate(
        buildCtx({ referer: 'https://arcadeum.games/en/contact' }),
      ),
    ).toBe(true);
  });

  it('rejects requests with no Origin or Referer (raw curl)', () => {
    expect(() => guard.canActivate(buildCtx({}))).toThrow(ForbiddenException);
  });

  it('rejects requests from a foreign origin', () => {
    expect(() =>
      guard.canActivate(buildCtx({ origin: 'https://evil.example' })),
    ).toThrow(ForbiddenException);
  });

  it('rejects a Referer that only contains an allowed origin as a substring', () => {
    expect(() =>
      guard.canActivate(
        buildCtx({ referer: 'https://evil.example/?u=https://arcadeum.games' }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('allows requests with a matching X-Internal-Token even without Origin', () => {
    expect(
      guard.canActivate(buildCtx({ 'x-internal-token': 'shared-secret-xyz' })),
    ).toBe(true);
  });

  it('rejects requests with a wrong X-Internal-Token and no Origin', () => {
    expect(() =>
      guard.canActivate(buildCtx({ 'x-internal-token': 'guess' })),
    ).toThrow(ForbiddenException);
  });

  it('ignores X-Internal-Token when SUPPORT_INTERNAL_TOKEN is unset', () => {
    delete process.env.SUPPORT_INTERNAL_TOKEN;
    guard = new OriginGuard();
    // No token, but with a foreign Origin — still rejected.
    expect(() =>
      guard.canActivate(
        buildCtx({
          'x-internal-token': 'anything',
          origin: 'https://evil.example',
        }),
      ),
    ).toThrow(ForbiddenException);
  });

  describe('dev convenience fallback', () => {
    it('allows no-Origin/no-Referer requests in dev when token is unset', () => {
      delete process.env.SUPPORT_INTERNAL_TOKEN;
      process.env.NODE_ENV = 'development';
      guard = new OriginGuard();
      expect(guard.canActivate(buildCtx({}))).toBe(true);
    });

    it('still rejects no-Origin requests in production when token is unset', () => {
      delete process.env.SUPPORT_INTERNAL_TOKEN;
      process.env.NODE_ENV = 'production';
      guard = new OriginGuard();
      expect(() => guard.canActivate(buildCtx({}))).toThrow(ForbiddenException);
    });

    it('does not take the fallback when a foreign Origin is present', () => {
      delete process.env.SUPPORT_INTERNAL_TOKEN;
      process.env.NODE_ENV = 'development';
      guard = new OriginGuard();
      expect(() =>
        guard.canActivate(buildCtx({ origin: 'https://evil.example' })),
      ).toThrow(ForbiddenException);
    });
  });
});
