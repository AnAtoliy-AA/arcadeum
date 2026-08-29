import { NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_LOCALE,
  EN_SLUGS,
  LOCALE_SLUGS,
  SUPPORTED_LOCALES,
  type Locale,
  type SlugKey,
} from '@/shared/config/locale-slugs';

const PUBLIC_FILE =
  /\.(?:png|jpg|jpeg|webp|avif|svg|ico|txt|xml|js|map|json|woff2?|css|mp4|mp3|pdf)$/i;
const SKIP_PREFIXES = [
  '/_next',
  '/_vercel',
  '/api',
  '/sw.js',
  '/offline',
  '/manifest',
  '/icon',
  '/favicon',
  '/apple-touch-icon',
];

function pickSupported(value: string | undefined | null): Locale | null {
  if (!value) return null;
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
    ? (value as Locale)
    : null;
}

/**
 * If `segment` is the canonical English slug for some page, return the
 * matching key — used to rewrite a wrong-locale-for-slug URL (e.g.
 * `/fr/games`) to the localized canonical (`/fr/jeux`).
 */
const EN_SLUG_TO_KEY: Record<string, SlugKey> = Object.fromEntries(
  Object.entries(EN_SLUGS).map(([key, slug]) => [slug, key as SlugKey]),
);

/**
 * Slug keys whose pages must never be indexed (per-user, transactional,
 * or internal). We emit `<meta name="robots">` via `buildPageMetadata`
 * already; this header is defense in depth — it takes effect on non-HTML
 * responses too and survives any future page-level oversight.
 */
const PRIVATE_SLUG_KEYS: ReadonlySet<SlugKey> = new Set([
  'auth',
  'chat',
  'chats',
  'history',
  'settings',
  'stats',
  'referrals',
  'admin',
  'payment',
  'wallet',
  'shop',
  'rooms',
]);

/**
 * Within /games, these sub-paths are private even though /games itself is
 * public. The middleware looks at the third URL segment to decide.
 */
const PRIVATE_GAMES_SUBPATHS: ReadonlySet<string> = new Set(['create']);

function isPrivatePath(locale: Locale, segmentsAfterLocale: string[]): boolean {
  const [first, second] = segmentsAfterLocale;
  if (!first) return false;

  const slugMap = LOCALE_SLUGS[locale];
  for (const key of PRIVATE_SLUG_KEYS) {
    if (slugMap[key] === first) return true;
  }
  if (slugMap.games === first && second && PRIVATE_GAMES_SUBPATHS.has(second)) {
    return true;
  }
  return false;
}

function isAdminPath(locale: Locale, segmentsAfterLocale: string[]): boolean {
  const [first] = segmentsAfterLocale;
  if (!first) return false;
  return LOCALE_SLUGS[locale].admin === first;
}

function isVercelFeedbackOrigin(origin: string | null): boolean {
  if (!origin) return false;

  try {
    const url = new URL(origin);
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'vercel.live' ||
        url.hostname === 'arcadeum.vercel.app' ||
        url.hostname === 'arcadeum-dev.vercel.app')
    );
  } catch {
    return false;
  }
}

function handleVercelFeedbackPreflight(req: NextRequest): NextResponse | null {
  if (req.method !== 'OPTIONS') return null;

  const origin = req.headers.get('origin');
  if (
    !req.headers.get('access-control-request-method') ||
    !isVercelFeedbackOrigin(origin)
  ) {
    return null;
  }

  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', origin!);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    req.headers.get('access-control-request-headers') ?? 'content-type',
  );
  response.headers.set('Access-Control-Max-Age', '600');
  response.headers.set(
    'Vary',
    'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
  );
  return response;
}

function getLocaleFromCountry(countryCode?: string | null): Locale | null {
  if (!countryCode) return null;
  const code = countryCode.toUpperCase();
  if (
    [
      'ES',
      'MX',
      'AR',
      'CO',
      'PE',
      'VE',
      'CL',
      'EC',
      'GT',
      'CU',
      'BO',
      'DO',
      'HN',
      'PY',
      'SV',
      'NI',
      'CR',
      'PA',
      'UY',
      'GQ',
    ].includes(code)
  ) {
    return 'es';
  }
  if (
    [
      'FR',
      'CA',
      'MC',
      'CD',
      'CG',
      'CI',
      'SN',
      'MG',
      'CM',
      'ML',
      'NE',
      'TG',
      'BJ',
      'BI',
      'DJ',
      'RW',
      'GQ',
      'KM',
      'LU',
      'CH',
      'BE',
    ].includes(code)
  ) {
    return 'fr';
  }
  if (code === 'BY') {
    return 'by';
  }
  if (
    ['RU', 'UA', 'KZ', 'UZ', 'KG', 'TJ', 'TM', 'MD', 'AM', 'AZ', 'GE'].includes(
      code,
    )
  ) {
    return 'ru';
  }
  return null;
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const feedbackPreflight = handleVercelFeedbackPreflight(req);
  if (feedbackPreflight) return feedbackPreflight;

  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  if (PUBLIC_FILE.test(pathname)) return NextResponse.next();

  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0] ?? '';
  const localeFromUrl = pickSupported(firstSegment);

  // Case 1: URL has a valid locale prefix. Check whether the next segment
  // is an English slug under a non-English locale — if so, redirect to
  // the canonical localized slug in one hop.
  if (localeFromUrl) {
    const secondSegment = segments[1];
    if (localeFromUrl !== 'en' && secondSegment) {
      const key = EN_SLUG_TO_KEY[secondSegment];
      if (key) {
        const localizedSlug = LOCALE_SLUGS[localeFromUrl][key];
        if (localizedSlug !== secondSegment) {
          const url = req.nextUrl.clone();
          const rest = segments.slice(2).join('/');
          url.pathname = `/${localeFromUrl}/${localizedSlug}${
            rest ? '/' + rest : ''
          }`;
          url.search = search;
          return NextResponse.redirect(url, 308);
        }
      }
    }
    const response = NextResponse.next();
    if (isPrivatePath(localeFromUrl, segments.slice(1))) {
      response.headers.set('x-robots-tag', 'noindex, nofollow');
    }
    if (
      isAdminPath(localeFromUrl, segments.slice(1)) &&
      !req.cookies.get('access_token')?.value &&
      !req.cookies.get('web_access_token')?.value &&
      req.headers.get('accept')?.includes('text/html')
    ) {
      return new Response(null, { status: 404 });
    }
    return response;
  }

  // Case 2: URL has no locale prefix. Pick locale via cookie -> Accept-
  // Language -> GeoIP -> default, then map the (possibly English) first segment
  // to the localized slug for that locale in one redirect.
  const cookieLocale = req.cookies.get('app-language')?.value;
  const headerLocale = req.headers
    .get('accept-language')
    ?.split(',')[0]
    ?.split('-')[0]
    ?.toLowerCase();

  const ipCountry =
    req.headers.get('x-vercel-ip-country') ?? req.headers.get('cf-ipcountry');
  const ipLocale = getLocaleFromCountry(ipCountry);

  const locale =
    pickSupported(cookieLocale) ??
    pickSupported(headerLocale) ??
    ipLocale ??
    DEFAULT_LOCALE;

  const url = req.nextUrl.clone();
  if (pathname === '/') {
    // Serve the default locale at `/` directly (no redirect) to avoid a
    // 308 round-trip that hurts LCP / TTI for first-time visitors.
    if (locale === DEFAULT_LOCALE) {
      url.pathname = `/${locale}`;
      url.search = search;
      return NextResponse.rewrite(url);
    }
    url.pathname = `/${locale}`;
  } else {
    const first = segments[0];
    const rest = segments.slice(1).join('/');
    const key = first ? EN_SLUG_TO_KEY[first] : undefined;
    const mapped = key ? LOCALE_SLUGS[locale][key] : first;
    url.pathname = `/${locale}/${mapped}${rest ? '/' + rest : ''}`;
  }
  url.search = search;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ['/((?!_next|_vercel|api|.*\\..*).*)'],
};
