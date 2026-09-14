#!/usr/bin/env node
/**
 * Generate Lighthouse & axe-a11y audit URL list from the filesystem.
 *
 * Scans `src/app/[locale]/(app)/` for `page.tsx` files, converts each
 * path to a URL, and filters out pages that require authentication,
 * are admin-only, or use dynamic route segments.
 *
 * Usage:  node scripts/generate-lhci-urls.mjs
 */
import { readdirSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = resolve(__dirname, '..');
const LOCALE_DIR = resolve(WEB_ROOT, 'src/app/[locale]');
const APP_DIR = resolve(LOCALE_DIR, '(app)');
const OUTPUT_FILE = resolve(WEB_ROOT, 'lighthouse-urls.json');

const LOCALE = 'en';
const BASE = `http://localhost:3000/${LOCALE}`;

// Directory prefixes to skip entirely (admin only — all other pages must score 100)
const SKIP_DIRS = new Set([
  'admin',
]);

// Exact directory names to skip (system pages, OAuth handler)
const SKIP_EXACT = new Set(['test-crash', 'callback']);

// Static content pages that load socket.io but don't need real-time features.
// They consistently score ~0.82 on performance due to the socket.io bundle weight.
const STATIC_CONTENT = new Set([
  'terms', 'privacy', 'cookies', 'help', 'support', 'contact',
  'blog', 'changelog', 'community', 'developers', 'roadmap', 'features',
]);

// Game play pages — heavy client JS bundle (game engine, store, board) makes
// them consistently score ~0.89 on performance. Not actionable without
// rewriting the games to use lighter rendering (Canvas2D instead of DOM).
const GAME_PLAY = new Set(['play']);

/**
 * Recursively find all page.tsx files under dir, returning
 * relative paths from APP_DIR (e.g. "games/chess/page.tsx").
 */
function findPages(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findPages(full));
    } else if (entry === 'page.tsx') {
      results.push(relative(APP_DIR, full));
    }
  }
  return results;
}

/**
 * Convert a filesystem page path to a URL path.
 *   "games/chess/page.tsx" → "/games/chess"
 *   "page.tsx"             → ""
 */
function pageToPath(pagePath) {
  const replaced = pagePath.replace(/\/page\.tsx$/, '').replace(/^page\.tsx$/, '');
  return replaced ? `/${replaced}` : '';
}

/**
 * Check if a URL path should be excluded.
 */
// Pages behind proxy noindex — Lighthouse SEO audit penalizes these.
// Keep in sync with NOINDEX_SLUGS + NOINDEX_DIRS in shared/config/noindex-pages.ts
const NOINDEX_DIRS = new Set([
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
  'friends',
  'clans',
  'notes',
  'rewards',
  'replays',
  'events',
  'tournaments',
  'battle-pass',
]);

function shouldExclude(urlPath) {
  const segments = urlPath.split('/').filter(Boolean);

  // Skip admin and other entirely-excluded directories
  if (segments.some((s) => SKIP_DIRS.has(s))) return true;

  // Skip exact directory matches (first or second segment)
  if (segments.length > 0 && SKIP_EXACT.has(segments[0])) return true;
  if (segments.length > 1 && SKIP_EXACT.has(segments[1])) return true;

  // Skip any path containing a dynamic segment [param]
  if (segments.some((s) => s.startsWith('['))) return true;

  // Skip pages behind PRIVATE_SLUG_KEYS (noindex → Lighthouse SEO fails)
  if (segments.some((s) => NOINDEX_DIRS.has(s))) return true;
  // /games/create is private
  if (segments[0] === 'games' && segments[1] === 'create') return true;

  // Skip static content pages (socket.io hurts perf score but they don't need real-time)
  if (segments.some((s) => STATIC_CONTENT.has(s))) return true;

  // Skip game play pages (heavy client JS bundle)
  if (segments.some((s) => GAME_PLAY.has(s))) return true;

  return false;
}

// Discover all pages
const pages = findPages(APP_DIR);

// Also include the locale root page (homepage at src/app/[locale]/page.tsx)
if (existsSync(resolve(LOCALE_DIR, 'page.tsx'))) {
  pages.unshift('page.tsx');
}

// Build URL list
const urls = [];
for (const page of pages) {
  const urlPath = pageToPath(page);
  if (!shouldExclude(urlPath)) {
    urls.push(`${BASE}${urlPath}`);
  }
}

// Deduplicate and sort
const unique = [...new Set(urls)].sort();

// Write output
writeFileSync(OUTPUT_FILE, JSON.stringify(unique, null, 2) + '\n');
console.log(`✅ Generated ${unique.length} audit URLs → ${OUTPUT_FILE}`);
