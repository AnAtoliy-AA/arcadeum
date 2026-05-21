import type { MetadataRoute } from 'next';

import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { SUPPORTED_LOCALES } from '@/shared/i18n/types';
import { hreflang, localePath } from '@/shared/i18n/locale-url';
import { gameMetadata } from '@/features/games/gameMetadata';
import type { GameMetadata } from '@/features/games/types';

type ChangeFreq = MetadataRoute.Sitemap[number]['changeFrequency'];

type Entry = {
  path: string;
  priority: number;
  changeFrequency: ChangeFreq;
  /** ISO date string. Omit when we have no honest signal — guessing hurts SEO. */
  lastModified?: string;
};

const STATIC_ENTRIES: Entry[] = [
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

function gameDetailEntries(): Entry[] {
  return Object.entries(gameMetadata)
    .filter(
      (entry): entry is [string, GameMetadata] =>
        entry[1] !== undefined && entry[1].status !== 'coming_soon',
    )
    .map(([id, meta]) => ({
      path: routes.gameDetail(id),
      priority: 0.7,
      changeFrequency: 'monthly' as const,
      lastModified: meta.lastUpdated,
    }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const allEntries = [...STATIC_ENTRIES, ...gameDetailEntries()];

  for (const { path, priority, changeFrequency, lastModified } of allEntries) {
    const languages: Record<string, string> = {};
    for (const locale of SUPPORTED_LOCALES) {
      languages[hreflang(locale)] = absolute(localePath(path, locale));
    }

    for (const locale of SUPPORTED_LOCALES) {
      const entry: MetadataRoute.Sitemap[number] = {
        url: absolute(localePath(path, locale)),
        changeFrequency,
        priority,
        alternates: { languages },
      };
      if (lastModified) {
        entry.lastModified = lastModified;
      }
      entries.push(entry);
    }
  }

  return entries;
}
