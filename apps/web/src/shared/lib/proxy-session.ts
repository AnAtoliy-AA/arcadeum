import type { NextRequest, NextResponse } from 'next/server';
import {
  ACCESS_COOKIE_NAMES,
  REFRESH_COOKIE_NAMES,
  findCookie,
} from './auth-cookies';
import {
  refreshWithCookie,
  type RefreshedSession,
} from './session-refresh-core';

function isPrefetch(req: NextRequest): boolean {
  return (
    Boolean(req.headers.get('next-router-prefetch')) ||
    req.headers.get('purpose') === 'prefetch'
  );
}

/**
 * The browser drops the httpOnly access cookie after 15 minutes while the
 * 30 day refresh cookie stays. When a real navigation or Server Action
 * arrives in that state, refresh here so every Server Component, Server
 * Action and Route Handler downstream sees a valid session, and the browser
 * receives the rotated cookies. Prefetches are skipped: they are speculative
 * and many can race on the same refresh token.
 */
export async function refreshSessionForRequest(
  req: NextRequest,
): Promise<RefreshedSession | null> {
  if (isPrefetch(req) || findCookie(req.cookies, ACCESS_COOKIE_NAMES)) {
    return null;
  }
  const refresh = findCookie(req.cookies, REFRESH_COOKIE_NAMES);
  if (!refresh) return null;
  return refreshWithCookie(refresh);
}

/** Request headers whose `Cookie` carries the refreshed session. */
export function withRefreshedCookies(
  req: NextRequest,
  session: RefreshedSession,
): Headers {
  const replaced = new Set(session.cookies.map((c) => c.name));
  const kept = (req.headers.get('cookie') ?? '')
    .split(';')
    .map((p) => p.trim())
    .filter((p) => p && !replaced.has(p.split('=')[0]));
  const fresh = session.cookies
    // An expired/cleared cookie (legacy host-only cleanup) must not be sent on.
    .filter(
      (c) => c.value && !(c.options.expires && c.options.expires < new Date()),
    )
    .map((c) => `${c.name}=${encodeURIComponent(c.value)}`);
  const headers = new Headers(req.headers);
  headers.set('cookie', [...kept, ...fresh].join('; '));
  return headers;
}

export function applyRefreshedCookies(
  res: NextResponse,
  session: RefreshedSession,
): void {
  for (const c of session.cookies) res.cookies.set(c.name, c.value, c.options);
}
