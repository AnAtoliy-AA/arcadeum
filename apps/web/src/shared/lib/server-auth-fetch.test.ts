import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

const cookieValues: Record<string, string> = {};
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) =>
      name in cookieValues ? { value: cookieValues[name] } : undefined,
  })),
}));
vi.mock('./api-base', () => ({
  resolveApiUrl: (path: string) => `http://api.test${path}`,
}));

const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
vi.stubGlobal('fetch', fetchMock);

import { serverAuthFetch } from './server-auth-fetch';

function authHeader(): string | undefined {
  const init = fetchMock.mock.calls[0][1] as RequestInit;
  return (init.headers as Record<string, string>).Authorization;
}

beforeEach(() => {
  fetchMock.mockClear();
  for (const k of Object.keys(cookieValues)) delete cookieValues[k];
});

describe('serverAuthFetch', () => {
  it('sends no Authorization header when neither cookie nor token exist', async () => {
    await serverAuthFetch('/x');
    expect(authHeader()).toBeUndefined();
  });

  it('uses the access_token cookie when present', async () => {
    cookieValues.access_token = 'cookie-tok';
    await serverAuthFetch('/x');
    expect(authHeader()).toBe('Bearer cookie-tok');
  });

  it('uses an explicit accessToken when the cookie is missing (expired)', async () => {
    await serverAuthFetch('/x', { method: 'POST', accessToken: 'client-tok' });
    expect(authHeader()).toBe('Bearer client-tok');
    const init = fetchMock.mock.calls[0][1] as Record<string, unknown>;
    expect(init).not.toHaveProperty('accessToken');
  });
});
