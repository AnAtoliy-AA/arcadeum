import type { MetadataRoute } from 'next';

import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { SUPPORTED_LOCALES } from '@/shared/i18n';

type RouteKey =
  | 'home'
  | 'games'
  | 'gameCreate'
  | 'history'
  | 'settings'
  | 'auth'
  | 'chat'
  | 'chats'
  | 'support'
  | 'terms'
  | 'privacy'
  | 'contact'
  | 'stats'
  | 'referrals'
  | 'blog'
  | 'community'
  | 'cookies'
  | 'developers'
  | 'help'
  | 'leaderboards'
  | 'notes'
  | 'payment'
  | 'rewards'
  | 'tournaments'
  | 'wallet'
  | 'seaBattleLanding';

const ROUTE_KEYS: RouteKey[] = [
  'home',
  'games',
  'gameCreate',
  'history',
  'settings',
  'auth',
  'chat',
  'chats',
  'support',
  'terms',
  'privacy',
  'contact',
  'stats',
  'referrals',
  'blog',
  'community',
  'cookies',
  'developers',
  'help',
  'leaderboards',
  'notes',
  'payment',
  'rewards',
  'tournaments',
  'wallet',
];

const GAME_LANDING_KEYS: Array<{ key: RouteKey; lastUpdated?: string }> = [
  { key: 'seaBattleLanding', lastUpdated: '2026-05-18' },
];

function alternatesFor(key: RouteKey): Record<string, string> {
  return Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => {
      const r = buildRoutes(locale);
      const value = r[key];
      return [locale, `${appConfig.siteUrl}${value as string}`];
    }),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of SUPPORTED_LOCALES) {
    const r = buildRoutes(locale);
    for (const key of ROUTE_KEYS) {
      const url = `${appConfig.siteUrl}${r[key] as string}`;
      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: key === 'home' ? 1 : 0.8,
        alternates: { languages: alternatesFor(key) },
      });
    }
    for (const entry of GAME_LANDING_KEYS) {
      const url = `${appConfig.siteUrl}${r[entry.key] as string}`;
      entries.push({
        url,
        lastModified: entry.lastUpdated
          ? new Date(entry.lastUpdated)
          : new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: { languages: alternatesFor(entry.key) },
      });
    }
  }

  return entries;
}
