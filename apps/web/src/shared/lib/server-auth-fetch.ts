import 'server-only';
import { cookies } from 'next/headers';
import { resolveApiUrl } from './api-base';
import { ACCESS_COOKIE_NAMES, findCookie } from './auth-cookies';
import { refreshServerSession } from './server-session-refresh';

/**
 * Server-side fetch wrapper that automatically resolves the API URL, attaches
 * the access token from cookies, and includes the `X-Requested-With` header
 * required by the backend CSRF guard. Returns a raw `Response` so callers
 * can classify errors by status code as before.
 *
 * The httpOnly access cookie lives 15 minutes and only the browser refreshed
 * it, so a Server Action could hit the backend with no token or an expired
 * one. When the token is missing or the backend answers 401, the refresh
 * cookie is exchanged server-side (see `refreshServerSession`) and the call is
 * retried exactly once. This is the single place server code gets its auth.
 */
export async function serverAuthFetch(
  path: string,
  init?: RequestInit & { accessToken?: string },
): Promise<Response> {
  const { accessToken, ...fetchInit } = init ?? {};
  const cookieJar = await cookies();
  // An explicit token (forwarded by a client component from the session
  // store) wins over the httpOnly cookie: the cookie can be gone while the
  // client session is still valid (it refreshes in the browser).
  const token =
    accessToken || findCookie(cookieJar, ACCESS_COOKIE_NAMES)?.value;
  const url = resolveApiUrl(path);

  const send = (bearer?: string) =>
    fetch(url, {
      ...fetchInit,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(fetchInit.headers ?? {}),
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
    });

  const first = token ? await send(token) : null;
  if (first && first.status !== 401) return first;

  const refreshed = await refreshServerSession();
  if (refreshed) return send(refreshed);
  return first ?? send();
}
