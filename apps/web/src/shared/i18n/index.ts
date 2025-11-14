import { translations } from "./translations";
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
} from "./types";

export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
};

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
  return translations[locale] ?? {};
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value as Locale);
}

export function formatMessage(
  template: string | undefined,
  params: Record<string, string | number | undefined>,
): string | undefined {
  if (!template) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const replacement = params[key];
    if (replacement === undefined || replacement === null) {
      return match;
    }
    return String(replacement);
  });
}
