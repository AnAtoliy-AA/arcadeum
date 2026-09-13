import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type Locale,
  type TranslationBundle,
} from './types';

export { DEFAULT_LOCALE, SUPPORTED_LOCALES };
export type { Locale, TranslationBundle };

/**
 * Returns an empty translation bundle as a synchronous fallback.
 * The actual translations are loaded asynchronously via loadMessages().
 */
export function getMessages(_locale: Locale): TranslationBundle {
  return {
    common: {} as never,
    pages: {} as never,
    home: {} as never,
    settings: {} as never,
    support: {} as never,
    auth: {} as never,
    navigation: {} as never,
    chat: {} as never,
    chatList: {} as never,
    games: {} as never,
    history: {} as never,
    payments: {} as never,
    legal: {} as never,
    stats: {} as never,
    pwa: {} as never,
    referrals: {} as never,
    seo: {} as never,
    notifications: {} as never,
    battlePass: {} as never,
    musicPlayer: {} as never,
    wallet: {} as never,
  };
}

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value as Locale)
  );
}

// `by` is our internal slug for the Belarusian locale, but it's an ISO
// 3166 country code — not a valid BCP 47 language code. Lighthouse / GSC
// flag `hreflang="by"` as an unknown language. Map to `be` (ISO 639-1)
// when emitting hreflang.
const LOCALE_TO_HREFLANG: Record<Locale, string> = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  ru: 'ru',
  by: 'be',
};

export function localeToHreflang(locale: Locale): string {
  return LOCALE_TO_HREFLANG[locale];
}
