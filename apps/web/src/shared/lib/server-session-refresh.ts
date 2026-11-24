import 'server-only';
import { cookies } from 'next/headers';
import { REFRESH_COOKIE_NAMES, findCookie } from './auth-cookies';
import { refreshWithCookie } from './session-refresh-core';

type CookieJar = Awaited<ReturnType<typeof cookies>>;

/**
 * Cookies can only be written from Server Actions and Route Handlers. The
 * backend rotates the refresh token on every refresh, so a refresh whose
 * rotated cookie cannot be stored would log the user out. Probe first and
 * refuse to refresh where the response cannot carry the new cookies (Server
 * Component render; `proxy.ts` refreshes before those run).
 */
function canWriteCookies(jar: CookieJar): boolean {
  try {
    jar.delete('__arc_write_probe');
    return true;
  } catch {
    return false;
  }
}

/**
 * Exchange the httpOnly refresh cookie for a fresh access token from a Server
 * Action / Route Handler. Returns the raw access token, or null when there is
 * no refresh cookie, cookies are not writable here, or the backend rejects it.
 */
export async function refreshServerSession(): Promise<string | null> {
  try {
    const jar = await cookies();
    const refresh = findCookie(jar, REFRESH_COOKIE_NAMES);
    if (!refresh || !canWriteCookies(jar)) return null;
    const session = await refreshWithCookie(refresh);
    if (!session) return null;
    for (const c of session.cookies) jar.set(c.name, c.value, c.options);
    return session.accessToken;
  } catch (err) {
    console.error('[serverSessionRefresh] failed:', err);
    return null;
  }
}
