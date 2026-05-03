import type { MetadataRoute } from 'next';

import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';

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
  ].map((route) => ({
    url: `${appConfig.siteUrl}${route === routes.home ? '' : route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === routes.home ? 1 : 0.8,
  }));

  return sitemapRoutes;
}
