import type { MetadataRoute } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { LOCALE_SLUGS, SUPPORTED_LOCALES } from '@/shared/config/locale-slugs';

export default function robots(): MetadataRoute.Robots {
  // Build a localized disallow list for `admin` so crawlers don't
  // attempt the per-locale admin paths (`/fr/admin`, `/es/admin`, …).
  const adminPaths = SUPPORTED_LOCALES.flatMap((locale) => [
    `/${locale}/${LOCALE_SLUGS[locale].admin}/`,
  ]);

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/private/', '/admin/', ...adminPaths, '/api/'],
      },
    ],
    sitemap: `${appConfig.siteUrl}/sitemap.xml`,
    host: appConfig.siteUrl.replace(/^https?:\/\//, ''),
  };
}
