import { resolveApiUrl } from './api-base';

/** A cookie ready for `cookies().set` / `NextResponse.cookies.set`. */
export interface ParsedCookie {
  name: string;
  /** Decoded value; Next re-encodes on write. */
  value: string;
  options: {
    domain?: string;
    path?: string;
    maxAge?: number;
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
  };
}

export interface RefreshedSession {
  accessToken: string;
  cookies: ParsedCookie[];
}

interface RefreshResponseBody {
  accessToken?: string;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Parse one `Set-Cookie` header. */
export function parseSetCookie(header: string): ParsedCookie | null {
  const [pair, ...attrs] = header.split(';').map((p) => p.trim());
  const eq = pair.indexOf('=');
  if (eq <= 0) return null;
  const options: ParsedCookie['options'] = {};
  for (const attr of attrs) {
    const i = attr.indexOf('=');
    const key = (i === -1 ? attr : attr.slice(0, i)).toLowerCase();
    const val = i === -1 ? '' : attr.slice(i + 1);
    if (key === 'domain') options.domain = val;
    else if (key === 'path') options.path = val;
    else if (key === 'max-age') options.maxAge = Number(val);
    else if (key === 'expires') options.expires = new Date(val);
    else if (key === 'httponly') options.httpOnly = true;
    else if (key === 'secure') options.secure = true;
    else if (key === 'samesite') {
      const s = val.toLowerCase();
      if (s === 'lax' || s === 'strict' || s === 'none') options.sameSite = s;
    }
  }
  return {
    name: pair.slice(0, eq),
    value: safeDecode(pair.slice(eq + 1)),
    options,
  };
}

/** Concurrent callers sharing one refresh cookie share one backend call. */
const inFlight = new Map<string, Promise<RefreshedSession | null>>();

async function callRefresh(refresh: {
  name: string;
  value: string;
}): Promise<RefreshedSession | null> {
  const res = await fetch(resolveApiUrl('/auth/refresh'), {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      // The backend reads (and decrypts) the refresh token from this cookie.
      Cookie: `${refresh.name}=${encodeURIComponent(refresh.value)}`,
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as RefreshResponseBody;
  if (!body.accessToken) return null;
  const cookies = res.headers
    .getSetCookie()
    .map(parseSetCookie)
    .filter((c): c is ParsedCookie => c !== null);
  return { accessToken: body.accessToken, cookies };
}

/**
 * Exchange the refresh cookie for a new session on the server. The backend
 * rotates the refresh token (reuse outside a 30s grace window revokes the
 * whole session), so callers MUST persist `cookies` on their response.
 * Returns null on any failure.
 */
export function refreshWithCookie(refresh: {
  name: string;
  value: string;
}): Promise<RefreshedSession | null> {
  const existing = inFlight.get(refresh.value);
  if (existing) return existing;
  const pending = callRefresh(refresh)
    .catch(() => null)
    .finally(() => inFlight.delete(refresh.value));
  inFlight.set(refresh.value, pending);
  return pending;
}
