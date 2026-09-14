import type { MetadataRoute } from 'next';

import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  localeToHreflang,
} from '@/shared/i18n';
import { POST_SLUGS, getPost } from '@/features/blog/registry';
import { FEATURED_PLAYER_IDS } from '@/shared/api/leaderboard';

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
  | 'seaBattleLanding'
  | 'criticalLanding'
  | 'glimwormLanding'
  | 'ticTacToeLanding'
  | 'cascadeLanding'
  | 'chessLanding'
  | 'checkersLanding'
  | 'catDashLanding'
  | 'solitaireLanding'
  | 'minesweeperLanding'
  | 'sudokuLanding'
  | 'game2048Landing'
  | 'backgammonLanding'
  | 'battleshipLanding'
  | 'heartsLanding'
  | 'spadesLanding'
  | 'goLanding'
  | 'pachisiLanding'
  | 'shop';

// Last-meaningful-content-change per page. Update by hand when the
// underlying copy/feature shifts so Google sees a real lastmod rather
// than a build-time `new Date()` heartbeat (which depresses crawl
// scheduling on stable pages).
const PAGE_LAST_MODIFIED: Record<RouteKey, string> = {
  home: '2026-09-06',
  games: '2026-09-06',
  gameCreate: '2026-09-06',
  history: '2026-09-06',
  settings: '2026-09-06',
  auth: '2026-09-06',
  chat: '2026-09-06',
  chats: '2026-09-06',
  support: '2026-09-06',
  terms: '2026-09-06',
  privacy: '2026-09-06',
  contact: '2026-09-06',
  stats: '2026-09-06',
  referrals: '2026-09-06',
  blog: '2026-09-06',
  community: '2026-09-06',
  cookies: '2026-09-06',
  developers: '2026-09-06',
  help: '2026-09-06',
  leaderboards: '2026-09-06',
  notes: '2026-09-06',
  payment: '2026-09-06',
  rewards: '2026-09-06',
  tournaments: '2026-09-06',
  wallet: '2026-09-06',
  seaBattleLanding: '2026-09-11',
  criticalLanding: '2026-09-11',
  glimwormLanding: '2026-09-11',
  ticTacToeLanding: '2026-09-11',
  cascadeLanding: '2026-09-11',
  chessLanding: '2026-09-11',
  checkersLanding: '2026-09-11',
  catDashLanding: '2026-09-11',
  solitaireLanding: '2026-09-11',
  minesweeperLanding: '2026-09-11',
  sudokuLanding: '2026-09-11',
  game2048Landing: '2026-09-11',
  backgammonLanding: '2026-09-11',
  battleshipLanding: '2026-09-11',
  heartsLanding: '2026-09-11',
  spadesLanding: '2026-09-11',
  goLanding: '2026-09-11',
  pachisiLanding: '2026-09-11',
  shop: '2026-09-06',
};

/**
 * Pages that the middleware marks `x-robots-tag: noindex, nofollow` (auth,
 * personal dashboards, payment flows, game-room creation). They have no
 * business in the sitemap — listing them wastes Google's crawl budget on
 * URLs it will refuse to index, and surfaces a "submitted URL marked
 * noindex" warning in Search Console.
 *
 * Keep this set in sync with `PRIVATE_SLUG_KEYS` in `src/proxy.ts`.
 */
const NOINDEX_KEYS: ReadonlySet<RouteKey> = new Set<RouteKey>([
  'auth',
  'chat',
  'chats',
  'history',
  'settings',
  'stats',
  'referrals',
  'payment',
  'wallet',
  'gameCreate',
  'shop',
  'notes',
  'rewards',
  'tournaments',
]);

const GAME_LANDING_KEYS: RouteKey[] = [
  'seaBattleLanding',
  'criticalLanding',
  'glimwormLanding',
  'ticTacToeLanding',
  'cascadeLanding',
  'chessLanding',
  'checkersLanding',
  'catDashLanding',
  'solitaireLanding',
  'minesweeperLanding',
  'sudokuLanding',
  'game2048Landing',
  'backgammonLanding',
  'battleshipLanding',
  'heartsLanding',
  'spadesLanding',
  'goLanding',
  'pachisiLanding',
];

const ROUTE_KEYS: RouteKey[] = (Object.keys(PAGE_LAST_MODIFIED) as RouteKey[])
  .filter((k) => !GAME_LANDING_KEYS.includes(k))
  .filter((k) => !NOINDEX_KEYS.has(k));

const PAGE_CHANGE_FREQ: Partial<
  Record<RouteKey, MetadataRoute.Sitemap[number]['changeFrequency']>
> = {
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
  criticalLanding: 'weekly',
  glimwormLanding: 'weekly',
  ticTacToeLanding: 'weekly',
  cascadeLanding: 'weekly',
  checkersLanding: 'weekly',
  catDashLanding: 'weekly',
  chessLanding: 'weekly',
  solitaireLanding: 'weekly',
  minesweeperLanding: 'weekly',
  sudokuLanding: 'weekly',
  game2048Landing: 'weekly',
  backgammonLanding: 'weekly',
  battleshipLanding: 'weekly',
  heartsLanding: 'weekly',
  spadesLanding: 'weekly',
  goLanding: 'weekly',
  pachisiLanding: 'weekly',
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
  shop: 'monthly',
};

/**
 * Per-page sitemap priority. Google uses this as a relative weighting only,
 * not as an absolute crawl-rate signal. Three tiers:
 *  - 1.0 : the front door
 *  - 0.9 : flagship landings + structurally important pages
 *  - 0.7 : public marketing / content surfaces
 *  - 0.5 : info pages (support, help, contact, developer portal)
 *  - 0.3 : legal pages (terms, privacy, cookies)
 */
const PAGE_PRIORITY: Record<RouteKey, number> = {
  home: 1,
  games: 0.9,
  seaBattleLanding: 0.9,
  criticalLanding: 0.9,
  glimwormLanding: 0.9,
  ticTacToeLanding: 0.9,
  cascadeLanding: 0.9,
  chessLanding: 0.9,
  checkersLanding: 0.9,
  catDashLanding: 0.9,
  solitaireLanding: 0.9,
  minesweeperLanding: 0.9,
  sudokuLanding: 0.9,
  game2048Landing: 0.9,
  backgammonLanding: 0.9,
  battleshipLanding: 0.9,
  heartsLanding: 0.9,
  spadesLanding: 0.9,
  goLanding: 0.9,
  pachisiLanding: 0.9,
  leaderboards: 0.7,
  tournaments: 0.7,
  rewards: 0.7,
  blog: 0.7,
  community: 0.7,
  notes: 0.7,
  help: 0.5,
  support: 0.5,
  contact: 0.5,
  developers: 0.5,
  terms: 0.3,
  privacy: 0.3,
  cookies: 0.3,
  auth: 0.3,
  chat: 0.3,
  chats: 0.3,
  history: 0.3,
  settings: 0.3,
  stats: 0.3,
  referrals: 0.3,
  payment: 0.3,
  wallet: 0.3,
  gameCreate: 0.3,
  shop: 0.3,
};

function alternatesFor(key: RouteKey): Record<string, string> {
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => {
      const r = buildRoutes(locale);
      const value = r[key];
      return [
        localeToHreflang(locale),
        `${appConfig.siteUrl}${value as string}`,
      ];
    }),
  );
  // `x-default` points search engines at the English page for users whose
  // language/locale isn't covered by the alternates above (matches the
  // head-level hreflang emitted by `buildPageMetadata`).
  languages['x-default'] =
    `${appConfig.siteUrl}${buildRoutes(DEFAULT_LOCALE)[key] as string}`;
  return languages;
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
        priority: PAGE_PRIORITY[key] ?? 0.5,
        alternates: { languages: alternatesFor(key) },
      });
    }
    for (const key of GAME_LANDING_KEYS) {
      const url = `${appConfig.siteUrl}${r[key] as string}`;
      entries.push({
        url,
        lastModified: new Date(PAGE_LAST_MODIFIED[key]),
        changeFrequency: PAGE_CHANGE_FREQ[key] ?? 'weekly',
        priority: PAGE_PRIORITY[key] ?? 0.9,
        alternates: { languages: alternatesFor(key) },
      });
    }

    // Blog posts. Each post emits one entry per locale that actually
    // has a translation, with hreflang alternates that include only the
    // translated locales (plus `x-default`). Skipping untranslated
    // locales avoids pointing Google at a fallback that would dilute
    // the language-clustering signal.
    for (const slug of POST_SLUGS) {
      const post = getPost(slug, locale);
      if (!post || post.locale !== locale) continue;

      const postLanguages: Record<string, string> = {
        // Unmatched languages fall back to the English post.
        'x-default': `${appConfig.siteUrl}${buildRoutes(DEFAULT_LOCALE).blogPost(slug)}`,
      };
      for (const l of SUPPORTED_LOCALES) {
        const localized = getPost(slug, l);
        if (localized && localized.locale === l) {
          postLanguages[localeToHreflang(l)] =
            `${appConfig.siteUrl}${buildRoutes(l).blogPost(slug)}`;
        }
      }

      entries.push({
        url: `${appConfig.siteUrl}${r.blogPost(slug)}`,
        lastModified: new Date(post.updatedAt ?? post.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: { languages: postLanguages },
      });
    }

    for (const playerId of FEATURED_PLAYER_IDS) {
      const playerLanguages: Record<string, string> = {
        'x-default': `${appConfig.siteUrl}${buildRoutes(DEFAULT_LOCALE).playerProfile(playerId)}`,
      };
      for (const l of SUPPORTED_LOCALES) {
        playerLanguages[localeToHreflang(l)] =
          `${appConfig.siteUrl}${buildRoutes(l).playerProfile(playerId)}`;
      }

      entries.push({
        url: `${appConfig.siteUrl}${r.playerProfile(playerId)}`,
        lastModified: new Date('2026-09-11'),
        changeFrequency: 'daily',
        priority: 0.7,
        alternates: { languages: playerLanguages },
      });
    }
  }

  return entries;
}
