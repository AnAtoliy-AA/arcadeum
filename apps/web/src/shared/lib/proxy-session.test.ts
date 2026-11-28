import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Staging build: the API (api-dev.) mints `dev_*` cookie names.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api-dev.arcadeum.games';
});

const refreshMock = vi.fn();
vi.mock('./session-refresh-core', () => ({
  refreshWithCookie: (c: unknown) => refreshMock(c),
}));

import {
  applyRefreshedCookies,
  refreshSessionForRequest,
  withRefreshedCookies,
} from './proxy-session';

function req(cookie: string, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/en/wallet', {
    headers: { cookie, ...headers },
  });
}

const session = {
  accessToken: 'fresh',
  cookies: [
    { name: 'dev_access_token', value: 'new+enc=', options: { maxAge: 900 } },
    { name: 'dev_refresh_token', value: 'rot', options: {} },
  ],
};

beforeEach(() => refreshMock.mockReset());

describe('refreshSessionForRequest', () => {
  it('refreshes when only the refresh cookie is present', async () => {
    refreshMock.mockResolvedValue(session);
    const out = await refreshSessionForRequest(req('dev_refresh_token=old'));
    expect(out).toBe(session);
    expect(refreshMock).toHaveBeenCalledWith({
      name: 'dev_refresh_token',
      value: 'old',
    });
  });

  it('does nothing when the access cookie is still there', async () => {
    const out = await refreshSessionForRequest(
      req('dev_access_token=a; dev_refresh_token=r'),
    );
    expect(out).toBeNull();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it('ignores prod-named cookies on a staging build', async () => {
    // Prod and staging share `.arcadeum.games`; a prod token is not ours.
    expect(
      await refreshSessionForRequest(req('access_token=a; refresh_token=r')),
    ).toBeNull();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it('returns null when the backend refresh fails', async () => {
    refreshMock.mockResolvedValue(null);
    expect(
      await refreshSessionForRequest(req('dev_refresh_token=revoked')),
    ).toBeNull();
  });

  it('does nothing for anonymous visitors', async () => {
    expect(await refreshSessionForRequest(req('app-language=en'))).toBeNull();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it('skips prefetch requests', async () => {
    const out = await refreshSessionForRequest(
      req('dev_refresh_token=r', { 'next-router-prefetch': '1' }),
    );
    expect(out).toBeNull();
    expect(refreshMock).not.toHaveBeenCalled();
  });
});

describe('request/response forwarding', () => {
  it('replaces the stale cookies in the forwarded Cookie header', () => {
    const headers = withRefreshedCookies(
      req('app-language=fr; dev_refresh_token=old'),
      session,
    );
    const cookie = headers.get('cookie') ?? '';
    expect(cookie).toContain('app-language=fr');
    expect(cookie).not.toContain('dev_refresh_token=old');
    expect(cookie).toContain('dev_refresh_token=rot');
    expect(cookie).toContain(
      `dev_access_token=${encodeURIComponent('new+enc=')}`,
    );
  });

  it('sets the rotated cookies on the response', () => {
    const res = NextResponse.next();
    applyRefreshedCookies(res, session);
    expect(res.cookies.get('dev_refresh_token')?.value).toBe('rot');
    expect(res.cookies.get('dev_access_token')?.value).toBe('new+enc=');
  });
});
