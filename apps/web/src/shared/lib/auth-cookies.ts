/**
 * Auth cookie names, in lookup order. Non-production hosts (staging, dev)
 * get a `dev_` prefix from the backend so they do not shadow production
 * cookies on the shared `.arcadeum.games` domain; `web_access_token` is the
 * legacy web-only name. Every server-side reader must go through these lists
 * so a staging session is never mistaken for an anonymous one.
 */
export const ACCESS_COOKIE_NAMES = [
  'dev_access_token',
  'access_token',
  'web_access_token',
] as const;

export const REFRESH_COOKIE_NAMES = [
  'dev_refresh_token',
  'refresh_token',
] as const;

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
