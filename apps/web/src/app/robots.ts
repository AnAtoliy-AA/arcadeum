import type { MetadataRoute } from 'next';

import { appConfig } from '@/shared/config/app-config';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/shared/i18n/types';

const PRIVATE_PATHS = [
  '/api/',
  '/admin/',
  '/auth',
  '/auth/callback',
  '/chat',
  '/chats',
  '/history',
  '/settings',
  '/stats',
  '/referrals',
  '/payment',
  '/payment/success',
  '/payment/cancel',
  '/games/create',
  '/games/rooms/',
  '/offline',
  '/test-crash',
];

function withLocalePrefixes(paths: string[]): string[] {
  const out = new Set<string>(paths);
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    for (const path of paths) {
      out.add(`/${locale}${path}`);
    }
  }
  return Array.from(out);
}

export default function robots(): MetadataRoute.Robots {
  const disallow = withLocalePrefixes(PRIVATE_PATHS);

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
      {
        userAgent: ['GPTBot', 'CCBot', 'anthropic-ai', 'Claude-Web'],
        allow: '/',
        disallow,
      },
    ],
    sitemap: `${appConfig.siteUrl}/sitemap.xml`,
    host: appConfig.siteUrl,
  };
}
