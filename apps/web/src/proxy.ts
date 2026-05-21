import { NextResponse, type NextRequest } from 'next/server';

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type Locale,
} from '@/shared/i18n/types';

const LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);
const COOKIE_NAME = 'app-language';

function pickLocaleFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  for (const part of header.split(',')) {
    const tag = part.split(';')[0]?.trim().toLowerCase() ?? '';
    const primary = tag.split('-')[0];
    if (primary === 'be') return 'by'; // BCP 47 Belarusian → internal `by`
    if (LOCALE_SET.has(primary)) return primary as Locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Locale URL strategy
 * -------------------
 * - Default locale (`en`) at the rootless path: `/games`.
 * - Other locales prefixed: `/es/games`, `/fr/games`, `/ru/games`, `/by/games`.
 * - Locale-prefixed URLs are *rewritten* internally to the unprefixed page so
 *   we don't need to duplicate the App Router tree under `[locale]/`.
 * - Every request gets an `x-locale` header so `generateMetadata` and the
 *   root layout can emit a self-referencing canonical and proper hreflang.
 * - The user's cookie is kept in sync with the URL so client code that still
 *   reads `app-language` (e.g. the language switcher fallback) stays correct.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/');
  const maybeLocale = segments[1];

  if (LOCALE_SET.has(maybeLocale)) {
    const locale = maybeLocale as Locale;

    if (locale === DEFAULT_LOCALE) {
      // Default locale should never appear in the URL — strip the prefix
      // with a permanent redirect to consolidate signals on the rootless URL.
      const url = request.nextUrl.clone();
      url.pathname = '/' + segments.slice(2).join('/');
      if (!url.pathname || url.pathname === '/') url.pathname = '/';
      return NextResponse.redirect(url, 308);
    }

    const url = request.nextUrl.clone();
    const stripped = '/' + segments.slice(2).join('/');
    url.pathname = stripped === '/' ? '/' : stripped.replace(/\/$/, '');

    const response = NextResponse.rewrite(url);
    response.headers.set('x-locale', locale);
    response.headers.set('x-locale-pathname', pathname);
    response.cookies.set(COOKIE_NAME, locale, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  // No locale prefix — default locale serves this URL.
  const response = NextResponse.next();
  response.headers.set('x-locale', DEFAULT_LOCALE);
  response.headers.set('x-locale-pathname', pathname);

  // First-time visitor: seed the cookie from Accept-Language so the language
  // switcher has a sensible initial state without changing what gets served.
  if (!request.cookies.get(COOKIE_NAME)) {
    const detected = pickLocaleFromAcceptLanguage(
      request.headers.get('accept-language'),
    );
    response.cookies.set(COOKIE_NAME, detected, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals, the API, static assets, and PWA files.
    '/((?!_next/|api/|favicon\\.ico|favicon\\.png|robots\\.txt|sitemap\\.xml|manifest\\.json|icon-.*\\.png|logo\\.png|sw\\.js|workbox-.*\\.js|games/|slides/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|woff|woff2|ttf|eot)).*)',
  ],
};
