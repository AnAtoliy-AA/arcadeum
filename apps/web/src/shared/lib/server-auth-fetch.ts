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
  init?: RequestInit,
): Promise<Response> {
  const cookieJar = await cookies();
  const token = cookieJar.get('access_token')?.value;
  const url = resolveApiUrl(path);

  return fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
