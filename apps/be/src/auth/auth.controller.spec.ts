import { AuthController } from './auth.controller';

function build() {
  const authService = {
    exchangeCode: jest
      .fn()
      .mockResolvedValue({ accessToken: 'google', refreshToken: 'g-refresh' }),
    refreshToken: jest.fn().mockResolvedValue({
      accessToken: 'a',
      accessTokenExpiresAt: null,
      refreshToken: 'r',
      refreshTokenExpiresAt: new Date(Date.now() + 1000),
    }),
  };
  const config = {
    get: jest.fn((k: string) =>
      k === 'AUTH_JWT_SECRET' ? 'secret' : undefined,
    ),
  };
  const controller = new AuthController(
    authService as never,
    {} as never,
    {} as never,
    config as never,
  );
  return { controller, authService };
}

describe('AuthController', () => {
  it('POST /auth/token does not set session cookies', async () => {
    const { controller } = build();
    const result = await controller.exchange({
      code: 'c',
    });
    expect(result).toEqual({
      accessToken: 'google',
      refreshToken: 'g-refresh',
    });
  });

  it('POST /auth/refresh prefers the cookie over a stale body token', async () => {
    const { controller, authService } = build();
    const res = { cookie: jest.fn(), clearCookie: jest.fn() };
    const req = {
      cookies: { refresh_token: 'cookie-token' },
      get: () => 'api.arcadeum.games',
    };
    await controller.refresh(
      { refreshToken: 'body-token' },
      req as never,
      res as never,
    );
    expect(authService.refreshToken).toHaveBeenCalledWith('cookie-token');
    expect(res.cookie).toHaveBeenCalledWith(
      'refresh_token',
      expect.any(String),
      expect.objectContaining({ domain: '.arcadeum.games' }),
    );
  });

  it('POST /auth/refresh falls back to the body token without a cookie', async () => {
    const { controller, authService } = build();
    const res = { cookie: jest.fn(), clearCookie: jest.fn() };
    await controller.refresh(
      { refreshToken: 'body-token' },
      { cookies: {}, get: () => undefined } as never,
      res as never,
    );
    expect(authService.refreshToken).toHaveBeenCalledWith('body-token');
  });

  it('sets env-prefixed domain-wide cookies on staging and clears legacy ones', async () => {
    const { controller, authService } = build();
    const res = { cookie: jest.fn(), clearCookie: jest.fn() };
    const req = {
      cookies: { dev_refresh_token: 'stg-token', refresh_token: 'prod-token' },
      get: () => 'api-dev.arcadeum.games',
    };
    await controller.refresh({ refreshToken: '' }, req as never, res as never);
    expect(authService.refreshToken).toHaveBeenCalledWith('stg-token');
    const [name, , opts] = res.cookie.mock.calls[1] as [
      string,
      string,
      Record<string, unknown>,
    ];
    expect(name).toBe('dev_refresh_token');
    expect(opts).toEqual(
      expect.objectContaining({
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
      }),
    );
    // Shared with staging.arcadeum.games so its SSR/proxy sees the session.
    expect(opts).toEqual(
      expect.objectContaining({ domain: '.arcadeum.games' }),
    );
    const clears = res.clearCookie.mock.calls as [
      string,
      Record<string, unknown>,
    ][];
    const legacy = clears.find(([n]) => n === 'refresh_token');
    expect(legacy).toBeDefined();
    expect(legacy?.[1]).not.toHaveProperty('domain');
    // Old host-only dev_* cookies on the API host are expired too.
    const legacyDev = clears.find(([n]) => n === 'dev_refresh_token');
    expect(legacyDev).toBeDefined();
    expect(legacyDev?.[1]).not.toHaveProperty('domain');
  });

  it('POST /auth/logout clears live and legacy host-only cookies on prod', () => {
    const { controller } = build();
    const res = { cookie: jest.fn(), clearCookie: jest.fn() };
    controller.logout(
      { get: () => 'api.arcadeum.games' } as never,
      res as never,
    );
    const calls = res.clearCookie.mock.calls as [
      string,
      Record<string, unknown>,
    ][];
    const refresh = calls.filter(([n]) => n === 'refresh_token');
    expect(refresh.some(([, o]) => o.domain === '.arcadeum.games')).toBe(true);
    expect(refresh.some(([, o]) => !('domain' in o))).toBe(true);
  });

  it('POST /auth/logout on staging clears domain-wide and host-only dev_ cookies', () => {
    const { controller } = build();
    const res = { cookie: jest.fn(), clearCookie: jest.fn() };
    controller.logout(
      { get: () => 'api-dev.arcadeum.games' } as never,
      res as never,
    );
    const calls = res.clearCookie.mock.calls as [
      string,
      Record<string, unknown>,
    ][];
    const refresh = calls.filter(([n]) => n === 'dev_refresh_token');
    expect(refresh.some(([, o]) => o.domain === '.arcadeum.games')).toBe(true);
    expect(refresh.some(([, o]) => !('domain' in o))).toBe(true);
    // Prod-named cookies are never touched domain-wide from staging.
    expect(calls.some(([n, o]) => n === 'refresh_token' && 'domain' in o)).toBe(
      false,
    );
  });
});
