import type { MetadataRoute } from 'next';

import { appConfig } from '@/shared/config/app-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/games',
    '/history',
    '/settings',
    '/auth',
    '/support',
    '/terms',
    '/privacy',
    '/contact',
    '/stats',
    '/referrals',
  ].map((route) => ({
    url: `${appConfig.siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
