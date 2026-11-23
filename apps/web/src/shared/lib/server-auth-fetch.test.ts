import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

const cookieValues: Record<string, string> = {};
const setCookie = vi.fn();
const deleteCookie = vi.fn();
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) =>
      name in cookieValues ? { value: cookieValues[name] } : undefined,
    set: setCookie,
    delete: deleteCookie,
  })),
}));
vi.mock('./api-base', () => ({
  resolveApiUrl: (path: string) => `http://api.test${path}`,
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import { serverAuthFetch } from './server-auth-fetch';

function authHeader(): string | undefined {
  const init = fetchMock.mock.calls[0][1] as RequestInit;
  return (init.headers as Record<string, string>).Authorization;
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, status: 200 });
  setCookie.mockClear();
  deleteCookie.mockReset();
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

  it('reads the dev_ prefixed cookies used on staging', async () => {
    cookieValues.dev_access_token = 'staging-tok';
    await serverAuthFetch('/x');
    expect(authHeader()).toBe('Bearer staging-tok');
  });

  describe('server-side refresh', () => {
    function refreshResponse() {
      const headers = new Headers();
      headers.append(
        'set-cookie',
        'dev_access_token=newenc%3D; Path=/; Max-Age=900; HttpOnly; Secure; SameSite=Lax',
      );
      return new Response(JSON.stringify({ accessToken: 'fresh-tok' }), {
        status: 201,
        headers,
      });
    }

    it('refreshes and retries once when the backend answers 401', async () => {
      cookieValues.dev_access_token = 'expired';
      cookieValues.dev_refresh_token = 'refresh-enc';
      fetchMock
        .mockResolvedValueOnce({ ok: false, status: 401 })
        .mockResolvedValueOnce(refreshResponse())
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const res = await serverAuthFetch('/daily-rewards/claim', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(3);
      const [refreshUrl, refreshInit] = fetchMock.mock.calls[1] as [
        string,
        RequestInit,
      ];
      expect(refreshUrl).toBe('http://api.test/auth/refresh');
      expect((refreshInit.headers as Record<string, string>).Cookie).toBe(
        'dev_refresh_token=refresh-enc',
      );
      const retry = fetchMock.mock.calls[2][1] as RequestInit;
      expect((retry.headers as Record<string, string>).Authorization).toBe(
        'Bearer fresh-tok',
      );
      expect(setCookie).toHaveBeenCalledWith(
        'dev_access_token',
        'newenc=',
        expect.objectContaining({ maxAge: 900, httpOnly: true, secure: true }),
      );
    });

    it('refreshes before the first call when the access cookie is gone', async () => {
      cookieValues.refresh_token = 'refresh-enc';
      fetchMock
        .mockResolvedValueOnce(refreshResponse())
        .mockResolvedValueOnce({ ok: true, status: 200 });

      await serverAuthFetch('/x');

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(String(fetchMock.mock.calls[0][0])).toContain('/auth/refresh');
    });

    it('never retries more than once', async () => {
      cookieValues.access_token = 'expired';
      cookieValues.refresh_token = 'refresh-enc';
      fetchMock
        .mockResolvedValueOnce({ ok: false, status: 401 })
        .mockResolvedValueOnce(refreshResponse())
        .mockResolvedValueOnce({ ok: false, status: 401 });

      const res = await serverAuthFetch('/x');

      expect(res.status).toBe(401);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('returns the original 401 when the refresh is rejected', async () => {
      cookieValues.access_token = 'expired';
      cookieValues.refresh_token = 'bad';
      fetchMock
        .mockResolvedValueOnce({ ok: false, status: 401 })
        .mockResolvedValueOnce({ ok: false, status: 401 });

      const res = await serverAuthFetch('/x');

      expect(res.status).toBe(401);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('does not refresh when cookies are not writable (server render)', async () => {
      cookieValues.access_token = 'expired';
      cookieValues.refresh_token = 'refresh-enc';
      deleteCookie.mockImplementation(() => {
        throw new Error('Cookies can only be modified in a Server Action');
      });
      fetchMock.mockResolvedValueOnce({ ok: false, status: 401 });

      const res = await serverAuthFetch('/x');

      expect(res.status).toBe(401);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('does not call refresh without a refresh cookie', async () => {
      cookieValues.access_token = 'expired';
      fetchMock.mockResolvedValueOnce({ ok: false, status: 401 });

      await serverAuthFetch('/x');

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
