import { headers } from 'next/headers';

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from './types';

/**
 * URL strategy: default locale (`en`) lives at the rootless path
 * (`/games`); other locales live under a prefix (`/es/games`). This
 * matches Next.js Pages-router i18n defaults and keeps existing English
 * URLs canonical.
 */

const HREFLANG_BY_LOCALE: Record<Locale, string> = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  ru: 'ru',
  // BCP 47: Belarusian is `be`, not `by` (which is a region code).
  by: 'be',
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function hreflang(locale: Locale): string {
  return HREFLANG_BY_LOCALE[locale];
}

/**
 * Returns `/path` for the default locale, `/{locale}/path` otherwise.
 * Root (`/`) becomes `/` for default and `/{locale}` for others.
 */
export function localePath(path: string, locale: Locale): string {
  const clean = path === '/' ? '' : path;
  if (locale === DEFAULT_LOCALE) {
    return clean || '/';
  }
  return `/${locale}${clean}`;
}

/**
 * Map a `path` (without locale prefix) to all locale variants. Useful for
 * `alternates.languages` and sitemap entries.
 */
export function localeAlternates(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const locale of SUPPORTED_LOCALES) {
    out[hreflang(locale)] = localePath(path, locale);
  }
  out['x-default'] = localePath(path, DEFAULT_LOCALE);
  return out;
}

/**
 * Read the current request's locale from the `x-locale` header set by
 * `middleware.ts`. Falls back to the default locale when the header is
 * absent (e.g. during static generation or tests).
 */
export async function getRequestLocale(): Promise<Locale> {
  const requestHeaders = await headers();
  const value = requestHeaders.get('x-locale') ?? undefined;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
