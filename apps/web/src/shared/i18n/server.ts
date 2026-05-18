import { cookies } from 'next/headers';
import {
  loadMessages,
  isLocale,
  DEFAULT_LOCALE,
  type Locale,
  type TranslationBundle,
} from './index';

/**
 * Server-side utility to load translations.
 *
 * Prefer passing a locale (typically from `params.locale` on a page in the
 * `[locale]` segment). If omitted, falls back to the `app-language` cookie,
 * then the default locale.
 */
export async function getTranslations(
  locale?: Locale,
): Promise<TranslationBundle> {
  return loadMessages(locale ?? (await getServerLocale()));
}

/**
 * Read the current locale on the server. Pages in the `[locale]` segment
 * should pass `params.locale` directly to `getTranslations`; this helper
 * is for top-level layouts and standalone server routes.
 */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get('app-language')?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}
