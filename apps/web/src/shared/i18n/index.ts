import { translations } from './translations';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type ActionMessages,
  type AuthMessages,
  type CommonMessages,
  type HomeMessages,
  type LanguagePreference,
  type Locale,
  type SettingsMessages,
  type SupportMessages,
  type ThemeOptionMessages,
  type TranslationBundle,
} from './types';

export { DEFAULT_LOCALE, SUPPORTED_LOCALES };
export { loadMessages } from './messages';

export type {
  ActionMessages,
  CommonMessages,
  HomeMessages,
  LanguagePreference,
  Locale,
  AuthMessages,
  SettingsMessages,
  SupportMessages,
  ThemeOptionMessages,
  TranslationBundle,
};

export function getMessages(locale: Locale): TranslationBundle {
  // @ts-expect-error - translations only contains 'en' statically now
  return translations[locale] ?? translations[DEFAULT_LOCALE];
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

export function formatMessage(
  template: string | undefined,
  params: Record<string, string | number | undefined>,
): string | undefined {
  if (!template) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const replacement = params[key];
    if (replacement === undefined || replacement === null) {
      return match;
    }
    return String(replacement);
  });
}
