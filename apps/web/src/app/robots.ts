import type { MetadataRoute } from 'next';

import { appConfig } from '@/shared/config/app-config';

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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: ['GPTBot', 'CCBot', 'anthropic-ai', 'Claude-Web'],
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${appConfig.siteUrl}/sitemap.xml`,
    host: appConfig.siteUrl,
  };
}
