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

// Last-meaningful-content-change per page. Update by hand when the
// underlying copy/feature shifts so Google sees a real lastmod rather
// than a build-time `new Date()` heartbeat (which depresses crawl
// scheduling on stable pages).
const PAGE_LAST_MODIFIED: Record<RouteKey, string> = {
  home: '2026-05-18',
  games: '2026-05-18',
  gameCreate: '2026-05-15',
  history: '2026-05-10',
  settings: '2026-04-20',
  auth: '2026-03-20',
  chat: '2026-04-15',
  chats: '2026-04-15',
  support: '2026-03-10',
  terms: '2026-04-05',
  privacy: '2026-04-05',
  contact: '2026-03-20',
  stats: '2026-04-25',
  referrals: '2026-04-22',
  blog: '2026-05-01',
  community: '2026-04-10',
  cookies: '2026-04-05',
  developers: '2026-04-10',
  help: '2026-04-12',
  leaderboards: '2026-05-12',
  notes: '2026-05-08',
  payment: '2026-04-18',
  rewards: '2026-05-05',
  tournaments: '2026-05-15',
  wallet: '2026-05-05',
  seaBattleLanding: '2026-05-18',
};

const ROUTE_KEYS: RouteKey[] = Object.keys(PAGE_LAST_MODIFIED).filter(
  (k) => k !== 'seaBattleLanding',
) as RouteKey[];

const GAME_LANDING_KEYS: RouteKey[] = ['seaBattleLanding'];

const PAGE_CHANGE_FREQ: Partial<Record<RouteKey, MetadataRoute.Sitemap[number]['changeFrequency']>> = {
  home: 'daily',
  games: 'daily',
  leaderboards: 'daily',
  notes: 'daily',
  history: 'daily',
  stats: 'daily',
  tournaments: 'weekly',
  rewards: 'weekly',
  blog: 'weekly',
  community: 'weekly',
  seaBattleLanding: 'weekly',
  terms: 'yearly',
  privacy: 'yearly',
  cookies: 'yearly',
  contact: 'monthly',
  help: 'monthly',
  developers: 'monthly',
  auth: 'monthly',
  support: 'monthly',
  settings: 'monthly',
  payment: 'monthly',
  wallet: 'daily',
  chat: 'monthly',
  chats: 'monthly',
  referrals: 'weekly',
  gameCreate: 'monthly',
};

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
        lastModified: new Date(PAGE_LAST_MODIFIED[key]),
        changeFrequency: PAGE_CHANGE_FREQ[key] ?? 'monthly',
        priority: key === 'home' ? 1 : 0.8,
        alternates: { languages: alternatesFor(key) },
      });
    }
    for (const key of GAME_LANDING_KEYS) {
      const url = `${appConfig.siteUrl}${r[key] as string}`;
      entries.push({
        url,
        lastModified: new Date(PAGE_LAST_MODIFIED[key]),
        changeFrequency: PAGE_CHANGE_FREQ[key] ?? 'weekly',
        priority: 0.9,
        alternates: { languages: alternatesFor(key) },
      });
    }
  }

  return entries;
}
