import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./api-base', () => ({
  resolveApiUrl: (path: string) => `http://api.test${path}`,
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import { parseSetCookie, refreshWithCookie } from './session-refresh-core';

function okResponse(): Response {
  const headers = new Headers();
  headers.append('set-cookie', 'refresh_token=r%2B1; Path=/; HttpOnly');
  return new Response(JSON.stringify({ accessToken: 'a1' }), {
    status: 201,
    headers,
  });
}

beforeEach(() => fetchMock.mockReset());

describe('parseSetCookie', () => {
  it('parses name, decoded value and attributes', () => {
    const c = parseSetCookie(
      'access_token=ab%2Bc%3D; Domain=.arcadeum.games; Path=/; Max-Age=900; HttpOnly; Secure; SameSite=Lax',
    );
    expect(c).toEqual({
      name: 'access_token',
      value: 'ab+c=',
      options: {
        domain: '.arcadeum.games',
        path: '/',
        maxAge: 900,
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      },
    });
  });

  it('returns null for malformed headers', () => {
    expect(parseSetCookie('garbage')).toBeNull();
  });
});

describe('refreshWithCookie', () => {
  it('shares one backend call between concurrent callers', async () => {
    fetchMock.mockImplementation(async () => okResponse());
    const [a, b] = await Promise.all([
      refreshWithCookie({ name: 'refresh_token', value: 'same' }),
      refreshWithCookie({ name: 'refresh_token', value: 'same' }),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(a?.accessToken).toBe('a1');
    expect(b).toBe(a);
  });

  it('url-encodes the cookie value it forwards', async () => {
    fetchMock.mockResolvedValueOnce(okResponse());
    await refreshWithCookie({ name: 'refresh_token', value: 'a+b=' });
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>).Cookie).toBe(
      'refresh_token=a%2Bb%3D',
    );
  });

  it('returns null when the backend rejects or throws', async () => {
    fetchMock.mockResolvedValueOnce(new Response('no', { status: 401 }));
    expect(await refreshWithCookie({ name: 'r', value: 'x1' })).toBeNull();
    fetchMock.mockRejectedValueOnce(new Error('down'));
    expect(await refreshWithCookie({ name: 'r', value: 'x2' })).toBeNull();
  });
});
