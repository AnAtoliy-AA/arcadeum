const ALLOW = /^(https?:\/\/|\/)/;
const DENY = /^javascript:/i;

export function isSafeCtaHref(href: string | undefined | null): boolean {
  if (!href) return false;
  if (DENY.test(href)) return false;
  return ALLOW.test(href);
}
