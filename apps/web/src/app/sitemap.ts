import type { MetadataRoute } from 'next';

import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';

const GAME_LANDINGS: Array<{ path: string; lastUpdated?: string }> = [
  { path: routes.seaBattleLanding, lastUpdated: '2026-05-17' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapRoutes = [
    routes.home,
    routes.games,
    routes.gameCreate,
    routes.history,
    routes.settings,
    routes.auth,
    routes.chat,
    routes.chats,
    routes.support,
    routes.terms,
    routes.privacy,
    routes.contact,
    routes.stats,
    routes.referrals,
    routes.blog,
    routes.community,
    routes.cookies,
    routes.developers,
    routes.help,
    routes.leaderboards,
    routes.notes,
    routes.payment,
    routes.rewards,
    routes.tournaments,
    routes.wallet,
  ].map((route) => ({
    url: `${appConfig.siteUrl}${route === routes.home ? '' : route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === routes.home ? 1 : 0.8,
  }));

  const gameLandingEntries = GAME_LANDINGS.map((entry) => ({
    url: `${appConfig.siteUrl}${entry.path}`,
    lastModified: entry.lastUpdated ? new Date(entry.lastUpdated) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...sitemapRoutes, ...gameLandingEntries];
}
