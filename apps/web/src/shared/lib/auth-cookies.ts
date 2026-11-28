const ROOT_DOMAIN = 'arcadeum.games';
/** Mirrors `apps/be/src/auth/lib/cookie-domain.ts`. */
const PROD_SUBDOMAINS = new Set(['www', 'api']);

export interface AuthCookieNameSet {
  access: readonly string[];
  refresh: readonly string[];
}

function hostOf(base: string): string {
  try {
    return new URL(base).hostname.toLowerCase();
  } catch {
    return '';
  }
}

/** True for `*.arcadeum.games` hosts other than the apex, `www.` and `api.`. */
export function isNonProdArcadeumHost(host: string): boolean {
  if (host === ROOT_DOMAIN || !host.endsWith(`.${ROOT_DOMAIN}`)) return false;
  return !PROD_SUBDOMAINS.has(host.slice(0, -(ROOT_DOMAIN.length + 1)));
}

/**
 * The backend names auth cookies after its own host: non-prod API hosts
 * (api-dev.) write `dev_*`, everything else writes plain names. Staging and
 * prod cookies both live on `.arcadeum.games`, so every web build reads only
 * the names its own API mints: prod never mistakes a staging token for its
 * own and vice versa. `web_access_token` is the legacy web-only name.
 */
export function resolveAuthCookieNames(apiBase: string): AuthCookieNameSet {
  if (isNonProdArcadeumHost(hostOf(apiBase))) {
    return { access: ['dev_access_token'], refresh: ['dev_refresh_token'] };
  }
  return {
    access: ['access_token', 'web_access_token'],
    refresh: ['refresh_token'],
  };
}

// Same env as `resolveApiBase()`; read directly so modules that mock
// `api-base` still get real cookie names.
const NAMES = resolveAuthCookieNames(
  process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_WEB_API_BASE_URL ||
    '',
);

/** Auth cookie names for this deployment, in lookup order. */
export const ACCESS_COOKIE_NAMES: readonly string[] = NAMES.access;
export const REFRESH_COOKIE_NAMES: readonly string[] = NAMES.refresh;

export interface CookieReader {
  get(name: string): { value: string } | undefined;
}

export interface FoundCookie {
  name: string;
  value: string;
}

export function findCookie(
  jar: CookieReader,
  names: readonly string[],
): FoundCookie | null {
  for (const name of names) {
    const value = jar.get(name)?.value;
    if (value) return { name, value };
  }
  return null;
}
