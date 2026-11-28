const ROOT_DOMAIN = 'arcadeum.games';
const COOKIE_DOMAIN_PATTERN =
  /^\.?[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

/** Normalise a configured cookie domain; returns undefined when invalid. */
export function normalizeCookieDomain(
  value: string | undefined,
): string | undefined {
  const domain = value?.trim().toLowerCase();
  if (!domain || !COOKIE_DOMAIN_PATTERN.test(domain)) return undefined;
  return domain;
}

function isArcadeumHost(host: string): boolean {
  return host === ROOT_DOMAIN || host.endsWith(`.${ROOT_DOMAIN}`);
}

/**
 * Production serves the apex, `www.` and `api.`; every other subdomain
 * (staging., api-dev., dev., ...) is a non-production environment with its
 * own JWT secret and DB.
 */
const PROD_SUBDOMAINS = new Set(['www', 'api']);

export const NON_PROD_COOKIE_PREFIX = 'dev_';

export function isNonProdArcadeumHost(host: string): boolean {
  if (!isArcadeumHost(host) || host === ROOT_DOMAIN) return false;
  const sub = host.slice(0, -(ROOT_DOMAIN.length + 1));
  return !PROD_SUBDOMAINS.has(sub);
}

function publicHosts(req: { get(name: string): string | undefined }): string[] {
  return [req.get('x-forwarded-host'), req.get('host')]
    .map((c) =>
      firstHeaderValue(c ?? undefined)
        .split(':')[0]
        .toLowerCase(),
    )
    .filter(Boolean);
}

export interface AuthCookieNames {
  access: string;
  refresh: string;
}

/**
 * Cookie names are env-specific: prod and staging share `.arcadeum.games`
 * but have different JWT secrets, so identical names let one env's cookie
 * shadow the other's. Non-prod hosts get a prefix.
 */
export function resolveCookieNames(req: {
  get(name: string): string | undefined;
}): AuthCookieNames {
  const prefix = publicHosts(req).some(isNonProdArcadeumHost)
    ? NON_PROD_COOKIE_PREFIX
    : '';
  return {
    access: `${prefix}access_token`,
    refresh: `${prefix}refresh_token`,
  };
}

function firstHeaderValue(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? '').split(',')[0].trim();
}

/**
 * Resolve the cookie Domain attribute.
 *
 * Order: explicit config (`COOKIE_DOMAIN`), then the public host as seen by
 * the browser (`X-Forwarded-Host`, falling back to `Host`). Behind a proxy the
 * `Host` header is usually the internal upstream name, which previously
 * dropped the Domain and left host-only cookies the web app could not read.
 * Anything outside arcadeum.games, and non-prod subdomains, get no Domain
 * (host-only, safe default).
 */
export function resolveCookieDomain(
  req: { get(name: string): string | undefined },
  configured?: string,
): string | undefined {
  const explicit = normalizeCookieDomain(configured);
  if (explicit) return explicit;
  for (const host of publicHosts(req)) {
    // Non-prod hosts stay host-only unless COOKIE_DOMAIN is set explicitly,
    // so staging never writes domain-wide cookies that prod would receive.
    if (isNonProdArcadeumHost(host)) return undefined;
    if (isArcadeumHost(host)) return `.${ROOT_DOMAIN}`;
  }
  return undefined;
}
