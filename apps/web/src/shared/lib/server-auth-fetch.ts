import 'server-only';
import { cookies } from 'next/headers';
import { resolveApiUrl } from './api-base';

/**
 * Server-side fetch wrapper that automatically resolves the API URL, attaches
 * the access token from cookies, and includes the `X-Requested-With` header
 * required by the backend CSRF guard. Returns a raw `Response` so callers
 * can classify errors by status code as before.
 */
export async function serverAuthFetch(
  path: string,
  init?: RequestInit & { accessToken?: string },
): Promise<Response> {
  const { accessToken, ...fetchInit } = init ?? {};
  const cookieJar = await cookies();
  // An explicit token (forwarded by a client component from the session
  // store) wins over the httpOnly cookie: the 15 minute cookie can be gone
  // while the client session is still valid (it refreshes in the browser).
  const token =
    (accessToken || cookieJar.get('dev_access_token')?.value) ??
    cookieJar.get('access_token')?.value ??
    cookieJar.get('web_access_token')?.value;
  const url = resolveApiUrl(path);

  return fetch(url, {
    ...fetchInit,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(fetchInit.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
