/**
 * Single source of truth for pages that must never be indexed.
 *
 * Used by:
 * - src/proxy.ts — adds `x-robots-tag: noindex` HTTP header (slug-based)
 * - src/app/robots.ts — disallows in robots.txt (slug-based)
 * - src/app/sitemap.ts — excludes from sitemap (slug-based)
 * - scripts/generate-lhci-urls.mjs — excludes from Lighthouse audit (dir-based)
 * - Each page's `buildPageMetadata({ noIndex: true })`
 *
 * When adding a new private page, add it here and it propagates everywhere.
 */
import type { SlugKey } from './locale-slugs';

/**
 * Top-level slug keys that must never be indexed.
 * Used by proxy, robots.ts, sitemap.ts.
 */
export const NOINDEX_SLUGS: ReadonlySet<SlugKey> = new Set<SlugKey>([
  'auth',
  'chat',
  'chats',
  'history',
  'settings',
  'stats',
  'referrals',
  'payment',
  'wallet',
  'shop',
  'rooms',
  'notes',
  'friends',
  'clans',
  'rewards',
  'events',
  'tournaments',
]);

/**
 * Directory names (not slug keys) that must never be indexed.
 * These exist as directories under (app)/ but don't have EN_SLUGS entries.
 * Used by generate-lhci-urls.mjs.
 */
export const NOINDEX_DIRS: ReadonlySet<string> = new Set([
  'replays',
  'battle-pass',
]);

/**
 * Game sub-paths that are private even though /games is public.
 */
export const PRIVATE_GAME_SUBPATHS: ReadonlySet<string> = new Set([
  'create',
]);
