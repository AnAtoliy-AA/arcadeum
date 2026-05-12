import { describe, it, expect, vi, beforeEach } from 'vitest';

const cookiesMock = vi.fn();
const notFoundMock = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('next/headers', () => ({
  cookies: () => cookiesMock(),
}));

vi.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}));

vi.mock('server-only', () => ({}));

vi.mock('@/shared/lib/api-base', () => ({
  resolveApiUrl: (p: string) => `http://test${p}`,
}));

const setCookie = (token: string | null) => {
  cookiesMock.mockResolvedValue({
    get: (name: string) =>
      name === 'web_access_token' && token ? { value: token } : undefined,
  });
};

const setFetch = (impl: () => Promise<Response> | Response) => {
  vi.stubGlobal('fetch', vi.fn(impl as never));
};

const setFetchThrow = (err: Error) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(err)),
  );
};

const okJson = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200 });
const errStatus = (status: number) => new Response('', { status });

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.resetModules();
    cookiesMock.mockReset();
    notFoundMock.mockClear();
  });

  it('calls notFound when no token cookie', async () => {
    setCookie(null);
    const { requireAdmin } = await import('./requireAdmin');
    await expect(requireAdmin()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it('calls notFound when fetch throws (network error)', async () => {
    setCookie('t');
    setFetchThrow(new Error('ECONNREFUSED'));
    const { requireAdmin } = await import('./requireAdmin');
    await expect(requireAdmin()).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('calls notFound when /auth/me returns 401', async () => {
    setCookie('t');
    setFetch(() => errStatus(401));
    const { requireAdmin } = await import('./requireAdmin');
    await expect(requireAdmin()).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('calls notFound when /auth/me returns 5xx', async () => {
    setCookie('t');
    setFetch(() => errStatus(503));
    const { requireAdmin } = await import('./requireAdmin');
    await expect(requireAdmin()).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it.each([
    'free',
    'developer',
    'moderator',
    'supporter',
    'vip',
    'premium',
    'tester',
  ])('calls notFound when role is %s', async (role) => {
    setCookie('t');
    setFetch(() =>
      okJson({ id: '1', email: 'a', username: 'b', displayName: 'c', role }),
    );
    const { requireAdmin } = await import('./requireAdmin');
    await expect(requireAdmin()).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('returns the user when role is admin', async () => {
    setCookie('t');
    const profile = {
      id: '1',
      email: 'a',
      username: 'b',
      displayName: 'c',
      role: 'admin',
    };
    setFetch(() => okJson(profile));
    const { requireAdmin } = await import('./requireAdmin');
    await expect(requireAdmin()).resolves.toEqual(profile);
  });
});
