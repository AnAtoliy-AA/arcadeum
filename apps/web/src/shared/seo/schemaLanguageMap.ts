import type { Locale } from '@/shared/i18n';

/**
 * Maps internal locale codes to BCP-47 language tags for Schema.org
 * `inLanguage` values. Used by all JSON-LD builders (BlogPosting,
 * FAQPage, HowTo, VideoObject, etc.) and the locale layout.
 */
export const SCHEMA_LANGUAGE_MAP: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  ru: 'ru-RU',
  by: 'be-BY',
};
