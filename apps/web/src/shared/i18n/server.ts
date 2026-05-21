import { cookies, headers } from 'next/headers';
import {
  getMessages,
  DEFAULT_LOCALE,
  type Locale,
  type TranslationBundle,
} from './index';
import { isLocale } from './locale-url';

/**
 * Resolve the active locale for a request. The proxy sets `x-locale` from the
 * URL, which is the source of truth for SEO; the cookie is a fallback for
 * requests that bypass the proxy (e.g. static generation or tests).
 */
export async function getServerLocale(): Promise<Locale> {
  const [requestHeaders, cookieStore] = await Promise.all([
    headers(),
    cookies(),
  ]);
  const urlLocale = requestHeaders.get('x-locale') ?? undefined;
  if (isLocale(urlLocale)) return urlLocale;
  const cookieLocale = cookieStore.get('app-language')?.value;
  if (isLocale(cookieLocale)) return cookieLocale;
  return DEFAULT_LOCALE;
}

/**
 * Server-side utility to get translations for the active locale. Always
 * returns the URL-derived locale's bundle when the request was proxied.
 */
export async function getTranslations(): Promise<TranslationBundle> {
  const locale = await getServerLocale();
  return getMessages(locale);
}
