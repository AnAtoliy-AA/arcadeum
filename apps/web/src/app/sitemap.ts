import type { MetadataRoute } from 'next';

import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { SUPPORTED_LOCALES } from '@/shared/i18n/types';
import { hreflang, localePath } from '@/shared/i18n/locale-url';

type ChangeFreq = MetadataRoute.Sitemap[number]['changeFrequency'];

type Entry = {
  path: string;
  priority: number;
  changeFrequency: ChangeFreq;
};

const ENTRIES: Entry[] = [
  { path: routes.home, priority: 1.0, changeFrequency: 'daily' },
  { path: routes.games, priority: 0.9, changeFrequency: 'daily' },
  { path: routes.tournaments, priority: 0.8, changeFrequency: 'daily' },
  { path: routes.leaderboards, priority: 0.8, changeFrequency: 'hourly' },
  { path: routes.community, priority: 0.7, changeFrequency: 'weekly' },
  { path: routes.blog, priority: 0.7, changeFrequency: 'weekly' },
  { path: routes.notes, priority: 0.7, changeFrequency: 'weekly' },
  { path: routes.rewards, priority: 0.6, changeFrequency: 'weekly' },
  { path: routes.help, priority: 0.6, changeFrequency: 'monthly' },
  { path: routes.developers, priority: 0.5, changeFrequency: 'monthly' },
  { path: routes.support, priority: 0.5, changeFrequency: 'monthly' },
  { path: routes.contact, priority: 0.4, changeFrequency: 'yearly' },
  { path: routes.terms, priority: 0.3, changeFrequency: 'yearly' },
  { path: routes.privacy, priority: 0.3, changeFrequency: 'yearly' },
  { path: routes.cookies, priority: 0.3, changeFrequency: 'yearly' },
];

const absolute = (path: string): string =>
  `${appConfig.siteUrl}${path === '/' ? '' : path}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const { path, priority, changeFrequency } of ENTRIES) {
    const languages: Record<string, string> = {};
    for (const locale of SUPPORTED_LOCALES) {
      languages[hreflang(locale)] = absolute(localePath(path, locale));
    }

    for (const locale of SUPPORTED_LOCALES) {
      entries.push({
        url: absolute(localePath(path, locale)),
        lastModified,
        changeFrequency,
        priority,
        alternates: { languages },
      });
    }
  }

  return entries;
}
