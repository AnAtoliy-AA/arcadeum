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
    const res = { cookie: jest.fn() };
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
    const res = { cookie: jest.fn() };
    await controller.refresh(
      { refreshToken: 'body-token' },
      { cookies: {}, get: () => undefined } as never,
      res as never,
    );
    expect(authService.refreshToken).toHaveBeenCalledWith('body-token');
  });
});
