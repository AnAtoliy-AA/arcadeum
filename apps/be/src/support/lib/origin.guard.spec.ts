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
});
