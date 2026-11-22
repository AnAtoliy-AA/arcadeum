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
 * Anything outside arcadeum.games gets no Domain (host-only, safe default).
 */
export function resolveCookieDomain(
  req: { get(name: string): string | undefined },
  configured?: string,
): string | undefined {
  const explicit = normalizeCookieDomain(configured);
  if (explicit) return explicit;
  const candidates = [req.get('x-forwarded-host'), req.get('host')];
  for (const candidate of candidates) {
    const host = firstHeaderValue(candidate ?? undefined)
      .split(':')[0]
      .toLowerCase();
    if (host && isArcadeumHost(host)) return `.${ROOT_DOMAIN}`;
  }
  return undefined;
}
