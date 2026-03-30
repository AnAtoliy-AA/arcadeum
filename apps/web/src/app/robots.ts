import type { MetadataRoute } from 'next';

import { appConfig } from '@/shared/config/app-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/admin/'],
    },
    sitemap: `${appConfig.siteUrl}/sitemap.xml`,
  };
}
