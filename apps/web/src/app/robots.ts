import type { MetadataRoute } from 'next';
import { appConfig } from '@/shared/config/app-config';
import {
  LOCALE_SLUGS,
  SUPPORTED_LOCALES,
  type SlugKey,
} from '@/shared/config/locale-slugs';
import { NOINDEX_SLUGS } from '@/shared/config/noindex-pages';

export default function robots(): MetadataRoute.Robots {
  // Build a localized disallow list for every private slug across every
  // supported locale, e.g. `/fr/parametres/`, `/es/portafolio/`. Without
  // the per-locale variants, Googlebot would still attempt to crawl them
  // and the `x-robots-tag` header is the only thing that would catch it.
  const localizedPrivatePaths = SUPPORTED_LOCALES.flatMap((locale) =>
    [...NOINDEX_SLUGS].map(
      (key) => `/${locale}/${LOCALE_SLUGS[locale][key]}/`,
    ),
  );

  // /games is public, but creating a room is not. Room detail pages live
  // under /rooms, which is covered by PRIVATE_SLUG_KEYS above.
  const gameCreatePaths = SUPPORTED_LOCALES.flatMap((locale) => {
    const gamesSlug = LOCALE_SLUGS[locale].games;
    return [`/${locale}/${gamesSlug}/create/`];
  });

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/private/',
          '/admin/',
          '/api/',
          ...localizedPrivatePaths,
          ...gameCreatePaths,
        ],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'Google-Extended',
          'anthropic-ai',
          'ClaudeBot',
          'PerplexityBot',
          'Bytespider',
          'Amazonbot',
          'meta-externalagent',
          'FacebookBot',
          'Applebot-Extended',
          'CCBot',
        ],
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          ...localizedPrivatePaths,
          ...gameCreatePaths,
        ],
      },
    ],
    sitemap: `${appConfig.siteUrl}/sitemap.xml`,
    host: appConfig.siteUrl.replace(/^https?:\/\//, ''),
  };
}
