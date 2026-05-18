import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';

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

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  if (PUBLIC_FILE.test(pathname)) return NextResponse.next();

  const firstSegment = pathname.split('/')[1] ?? '';
  if (pickSupported(firstSegment)) return NextResponse.next();

  const cookieLocale = req.cookies.get('app-language')?.value;
  const headerLocale = req.headers
    .get('accept-language')
    ?.split(',')[0]
    ?.split('-')[0]
    ?.toLowerCase();

  const locale =
    pickSupported(cookieLocale) ??
    pickSupported(headerLocale) ??
    DEFAULT_LOCALE;

  const url = req.nextUrl.clone();
  const suffix = pathname === '/' ? '' : pathname;
  url.pathname = `/${locale}${suffix}`;
  url.search = search;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ['/((?!_next|_vercel|api|.*\\..*).*)'],
};
