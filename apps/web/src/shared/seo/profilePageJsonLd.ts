import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import type { Locale } from '@/shared/i18n';

const SCHEMA_LANGUAGE_MAP: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  ru: 'ru-RU',
  by: 'be-BY',
};

/**
 * Build schema.org ProfilePage + Person structured data for a player
 * profile. Google uses ProfilePage to recognize social-style pages and
 * surface them with author-attributed snippets.
 */
export function buildProfilePageJsonLd({
  locale,
  playerId,
  displayName,
  avatarUrl,
  description,
}: {
  locale: Locale;
  playerId: string;
  /** Visible username / display name. */
  displayName: string;
  /** Absolute URL of the player's avatar, if any. */
  avatarUrl?: string;
  /** Short biography or tagline. */
  description?: string;
}): Record<string, unknown> {
  const routes = buildRoutes(locale);
  const pageUrl = `${appConfig.siteUrl}${routes.home}/players/${encodeURIComponent(
    playerId,
  )}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: pageUrl,
    inLanguage: SCHEMA_LANGUAGE_MAP[locale],
    mainEntity: {
      '@type': 'Person',
      name: displayName,
      identifier: playerId,
      url: pageUrl,
      ...(avatarUrl ? { image: avatarUrl } : {}),
      ...(description ? { description } : {}),
    },
  };
}
