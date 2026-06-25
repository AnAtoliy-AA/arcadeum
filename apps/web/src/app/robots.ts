import type { MetadataRoute } from 'next';
import { appConfig } from '@/shared/config/app-config';
import {
  LOCALE_SLUGS,
  SUPPORTED_LOCALES,
  type SlugKey,
} from '@/shared/config/locale-slugs';

/**
 * Slug keys whose pages we never want indexed (per-user dashboards,
 * payment flows, the OAuth callback, admin). Mirrors `PRIVATE_SLUG_KEYS`
 * in `src/proxy.ts` so robots.txt, the `x-robots-tag` header, and
 * the sitemap give Google the same signal in three places. Belt and
 * braces — but cheap, and search-console reports get cleaner.
 */
const PRIVATE_SLUG_KEYS: readonly SlugKey[] = [
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
];

export default function robots(): MetadataRoute.Robots {
  // Build a localized disallow list for every private slug across every
  // supported locale, e.g. `/fr/parametres/`, `/es/portafolio/`. Without
  // the per-locale variants, Googlebot would still attempt to crawl them
  // and the `x-robots-tag` header is the only thing that would catch it.
  const localizedPrivatePaths = SUPPORTED_LOCALES.flatMap((locale) =>
    PRIVATE_SLUG_KEYS.map((key) => `/${locale}/${LOCALE_SLUGS[locale][key]}/`),
  );

  // /games is public, but creating or joining a specific room is not.
  const gameRoomPaths = SUPPORTED_LOCALES.flatMap((locale) => {
    const gamesSlug = LOCALE_SLUGS[locale].games;
    return [
      `/${locale}/${gamesSlug}/create/`,
      `/${locale}/${gamesSlug}/rooms/`,
    ];
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
          ...gameRoomPaths,
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
        ],
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          ...localizedPrivatePaths,
          ...gameRoomPaths,
        ],
      },
    ],
    sitemap: `${appConfig.siteUrl}/sitemap.xml`,
    host: appConfig.siteUrl.replace(/^https?:\/\//, ''),
  };
}
