import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const refreshMock = vi.fn();
vi.mock('@/shared/lib/proxy-session', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/lib/proxy-session')>();
  return {
    ...actual,
    refreshSessionForRequest: (req: NextRequest) => refreshMock(req),
  };
});

import { ADMIN_NOT_FOUND_SEGMENT, proxy } from './proxy';

function req(path: string, cookie = '') {
  return new NextRequest(`http://localhost${path}`, {
    headers: cookie ? { cookie } : {},
  });
}

const rewriteTarget = (res: Response) =>
  res.headers.get('x-middleware-rewrite');

beforeEach(() => {
  refreshMock.mockReset();
  refreshMock.mockResolvedValue(null);
});

describe('proxy admin gate', () => {
  it('renders the styled 404 for anonymous admin requests', async () => {
    const res = await proxy(req('/en/admin/users'));
    expect(res.status).toBe(200);
    expect(rewriteTarget(res)).toBe(
      `http://localhost/en/${ADMIN_NOT_FOUND_SEGMENT}`,
    );
    expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });

  it('lets a request with an access cookie through to requireAdmin', async () => {
    const res = await proxy(req('/en/admin', 'access_token=enc'));
    expect(rewriteTarget(res)).toBeNull();
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('lets an expired session through once the refresh succeeds', async () => {
    refreshMock.mockResolvedValue({
      accessToken: 'fresh',
      cookies: [
        { name: 'access_token', value: 'new', options: { maxAge: 900 } },
        { name: 'refresh_token', value: 'rot', options: { maxAge: 60 } },
      ],
    });
    const res = await proxy(req('/en/admin', 'refresh_token=old'));
    expect(rewriteTarget(res)).toBeNull();
    const setCookie = res.headers.getSetCookie().join('\n');
    expect(setCookie).toContain('access_token=new');
    expect(setCookie).toContain('refresh_token=rot');
  });

  it('falls back to not-found when the refresh fails', async () => {
    const res = await proxy(req('/en/admin', 'refresh_token=revoked'));
    expect(rewriteTarget(res)).toContain(ADMIN_NOT_FOUND_SEGMENT);
  });

  it('does not gate non-admin pages', async () => {
    const res = await proxy(req('/en/games'));
    expect(rewriteTarget(res)).toBeNull();
  });
});
