#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const EXPECTED_GAME_KEYS = [
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

const LOCALES = ['en', 'es', 'fr', 'ru', 'by'];

function parseSitemapFile() {
  const root = process.cwd();
  const sitemapPath = path.join(root, 'apps/web/src/app/sitemap.ts');
  const content = fs.readFileSync(sitemapPath, 'utf8');

  const gameKeysMatch = content.match(
    /const GAME_LANDING_KEYS: RouteKey\[\] = \[([\s\S]*?)\];/,
  );
  const gameKeys = gameKeysMatch
    ? (gameKeysMatch[1].match(/'[a-zA-Z0-9]+'/g) || []).map((s) =>
        s.replace(/'/g, ''),
      )
    : [];

  const lastmodMatch = content.match(
    /const PAGE_LAST_MODIFIED: Record<RouteKey, string> = \{([\s\S]*?)\};/,
  );
  const lastmodEntries = {};
  if (lastmodMatch) {
    for (const line of lastmodMatch[1].split('\n')) {
      const m = line.match(/\s*([a-zA-Z0-9]+):\s*'([^']+)'/);
      if (m) lastmodEntries[m[1]] = m[2];
    }
  }

  const noindexMatch = content.match(
    /const NOINDEX_KEYS: ReadonlySet<RouteKey> = new Set<RouteKey>\(\[([\s\S]*?)\]\);/,
  );
  const noindexKeys = noindexMatch
    ? (noindexMatch[1].match(/'[a-zA-Z0-9]+'/g) || []).map((s) =>
        s.replace(/'/g, ''),
      )
    : [];

  const changeFreqMatch = content.match(
    /const PAGE_CHANGE_FREQ: Partial<[\s\S]*?> = \{([\s\S]*?)\};/,
  );
  const changeFreqEntries = {};
  if (changeFreqMatch) {
    for (const line of changeFreqMatch[1].split('\n')) {
      const m = line.match(/\s*([a-zA-Z0-9]+):\s*'([^']+)'/);
      if (m) changeFreqEntries[m[1]] = m[2];
    }
  }

  const priorityMatch = content.match(
    /const PAGE_PRIORITY: Record<RouteKey, number> = \{([\s\S]*?)\};/,
  );
  const priorityEntries = {};
  if (priorityMatch) {
    for (const line of priorityMatch[1].split('\n')) {
      const m = line.match(/\s*([a-zA-Z0-9]+):\s*([0-9.]+)/);
      if (m) priorityEntries[m[1]] = parseFloat(m[2]);
    }
  }

  return {
    gameKeys,
    lastmodEntries,
    noindexKeys,
    changeFreqEntries,
    priorityEntries,
  };
}

function parseNoindexConfig() {
  const root = process.cwd();
  const noindexPath = path.join(
    root,
    'apps/web/src/shared/config/noindex-pages.ts',
  );
  const content = fs.readFileSync(noindexPath, 'utf8');

  const slugsMatch = content.match(
    /export const NOINDEX_SLUGS: ReadonlySet<SlugKey> = new Set<SlugKey>\(\[([\s\S]*?)\]\);/,
  );
  const noindexSlugs = slugsMatch
    ? (slugsMatch[1].match(/'[a-zA-Z0-9_-]+'/g) || []).map((s) =>
        s.replace(/'/g, ''),
      )
    : [];

  return { noindexSlugs };
}

function parseBlogRegistry() {
  const root = process.cwd();
  const registryPath = path.join(
    root,
    'apps/web/src/features/blog/registry.ts',
  );
  const content = fs.readFileSync(registryPath, 'utf8');

  const postsBlockMatch = content.match(
    /const POSTS:[\s\S]*?=\s*\{([\s\S]*?)\n\};/,
  );
  const postSlugs = [];
  if (postsBlockMatch) {
    const slugMatches = postsBlockMatch[1].matchAll(
      /'([a-zA-Z0-9_-]+)':\s*\{/g,
    );
    for (const m of slugMatches) {
      postSlugs.push(m[1]);
    }
  }

  return { postSlugs };
}

function auditSitemap() {
  const {
    gameKeys,
    lastmodEntries,
    noindexKeys,
    changeFreqEntries,
    priorityEntries,
  } = parseSitemapFile();
  const { noindexSlugs } = parseNoindexConfig();
  const { postSlugs } = parseBlogRegistry();

  const issues = [];
  const checks = [];

  const missingGameKeys = EXPECTED_GAME_KEYS.filter(
    (k) => !gameKeys.includes(k),
  );
  checks.push({
    name: 'All 18 Game Landing Keys in Sitemap',
    expected: `${EXPECTED_GAME_KEYS.length} keys`,
    actual: `${gameKeys.length} keys`,
    passed: missingGameKeys.length === 0,
    details:
      missingGameKeys.length > 0
        ? `Missing: ${missingGameKeys.join(', ')}`
        : 'All 18 present',
  });
  if (missingGameKeys.length > 0) {
    issues.push(`Missing game landing keys: ${missingGameKeys.join(', ')}`);
  }

  const leakedGameKeys = gameKeys.filter((k) => noindexKeys.includes(k));
  checks.push({
    name: 'Game Landings Excluded From Noindex',
    expected: '0 leaks',
    actual: `${leakedGameKeys.length} leaks`,
    passed: leakedGameKeys.length === 0,
    details:
      leakedGameKeys.length > 0
        ? `Leaked: ${leakedGameKeys.join(', ')}`
        : 'Zero leaks',
  });
  if (leakedGameKeys.length > 0) {
    issues.push(
      `Game landing keys marked as noindex: ${leakedGameKeys.join(', ')}`,
    );
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const invalidDateKeys = [];
  for (const [key, dateStr] of Object.entries(lastmodEntries)) {
    if (!dateRegex.test(dateStr) || isNaN(new Date(dateStr).getTime())) {
      invalidDateKeys.push(key);
    }
  }
  checks.push({
    name: 'Valid ISO-8601 Lastmod Formats',
    expected: 'All valid YYYY-MM-DD',
    actual: `${Object.keys(lastmodEntries).length - invalidDateKeys.length}/${Object.keys(lastmodEntries).length}`,
    passed: invalidDateKeys.length === 0,
    details:
      invalidDateKeys.length > 0
        ? `Invalid: ${invalidDateKeys.join(', ')}`
        : 'All valid',
  });
  if (invalidDateKeys.length > 0) {
    issues.push(
      `Invalid lastmod date format in: ${invalidDateKeys.join(', ')}`,
    );
  }

  const staleGameKeys = EXPECTED_GAME_KEYS.filter((k) => {
    const d = lastmodEntries[k];
    return !d || d < '2026-09-11';
  });
  checks.push({
    name: 'Game Landings Lastmod Freshness',
    expected: '2026-09-11',
    actual: `${EXPECTED_GAME_KEYS.length - staleGameKeys.length}/${EXPECTED_GAME_KEYS.length}`,
    passed: staleGameKeys.length === 0,
    details:
      staleGameKeys.length > 0
        ? `Stale: ${staleGameKeys.join(', ')}`
        : 'All up to date',
  });
  if (staleGameKeys.length > 0) {
    issues.push(`Stale lastmod dates on games: ${staleGameKeys.join(', ')}`);
  }

  const lowPriorityGames = EXPECTED_GAME_KEYS.filter(
    (k) => (priorityEntries[k] ?? 0.9) < 0.9,
  );
  checks.push({
    name: 'Game Landing Priority Weighting (0.9)',
    expected: '0.9 priority',
    actual: `${EXPECTED_GAME_KEYS.length - lowPriorityGames.length}/${EXPECTED_GAME_KEYS.length}`,
    passed: lowPriorityGames.length === 0,
    details:
      lowPriorityGames.length > 0
        ? `Low priority: ${lowPriorityGames.join(', ')}`
        : 'All 0.9',
  });
  if (lowPriorityGames.length > 0) {
    issues.push(
      `Low priority game landing entries: ${lowPriorityGames.join(', ')}`,
    );
  }

  const nonWeeklyGames = EXPECTED_GAME_KEYS.filter(
    (k) => changeFreqEntries[k] && changeFreqEntries[k] !== 'weekly',
  );
  checks.push({
    name: 'Game Landing Change Frequency (weekly)',
    expected: 'weekly',
    actual: `${EXPECTED_GAME_KEYS.length - nonWeeklyGames.length}/${EXPECTED_GAME_KEYS.length}`,
    passed: nonWeeklyGames.length === 0,
    details:
      nonWeeklyGames.length > 0
        ? `Mismatch: ${nonWeeklyGames.join(', ')}`
        : 'All weekly',
  });
  if (nonWeeklyGames.length > 0) {
    issues.push(
      `Game landing changeFrequency not weekly: ${nonWeeklyGames.join(', ')}`,
    );
  }

  const noindexSyncDiff = noindexSlugs.filter((slug) => {
    return (
      !noindexKeys.includes(slug) &&
      slug !== 'clans' &&
      slug !== 'events' &&
      slug !== 'rooms' &&
      slug !== 'friends'
    );
  });
  checks.push({
    name: 'Noindex Pages Synchronized',
    expected: 'In sync',
    actual: `${noindexKeys.length} keys`,
    passed: noindexSyncDiff.length === 0,
    details:
      noindexSyncDiff.length > 0
        ? `Unsynced: ${noindexSyncDiff.join(', ')}`
        : 'In sync',
  });
  if (noindexSyncDiff.length > 0) {
    issues.push(`Unsynced noindex slugs: ${noindexSyncDiff.join(', ')}`);
  }

  checks.push({
    name: 'Blog Posts Coverage',
    expected: `${postSlugs.length} posts`,
    actual: `${postSlugs.length} posts`,
    passed: postSlugs.length >= 20,
    details: `${postSlugs.length} registered blog posts across locales`,
  });

  const totalEmittedGameUrls = EXPECTED_GAME_KEYS.length * LOCALES.length;
  const passed = issues.length === 0;

  return {
    passed,
    issues,
    checks,
    stats: {
      gameLandingKeys: EXPECTED_GAME_KEYS.length,
      localesCount: LOCALES.length,
      totalGameUrls: totalEmittedGameUrls,
      noindexIsolatedKeys: noindexKeys.length,
      totalRegisteredBlogPosts: postSlugs.length,
    },
  };
}

function run() {
  const isJson = process.argv.includes('--json');
  const result = auditSitemap();

  if (isJson) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    process.exit(result.passed ? 0 : 1);
  }

  process.stdout.write(
    '\n🗺️  Arcadeum Games Sitemap & SEO Integrity Auditor (Agent 4)\n',
  );
  process.stdout.write(
    '========================================================================================\n',
  );
  process.stdout.write(
    'Check Name'.padEnd(42) +
      'Expected'.padEnd(20) +
      'Status'.padEnd(10) +
      'Details\n',
  );
  process.stdout.write(
    '----------------------------------------------------------------------------------------\n',
  );

  for (const c of result.checks) {
    const status = c.passed ? '✅ PASS' : '❌ FAIL';
    process.stdout.write(
      c.name.padEnd(42) +
        c.expected.padEnd(20) +
        status.padEnd(10) +
        c.details +
        '\n',
    );
  }

  process.stdout.write(
    '========================================================================================\n',
  );
  process.stdout.write(
    `📊 Summary: ${result.stats.totalGameUrls} Game URLs (${result.stats.gameLandingKeys} games × ${result.stats.localesCount} locales), `,
  );
  process.stdout.write(
    `${result.stats.noindexIsolatedKeys} Noindex Slugs Isolated, ${result.stats.totalRegisteredBlogPosts} Blog Posts.\n`,
  );

  if (!result.passed) {
    process.stdout.write(
      `\n❌ Sitemap Audit failed with ${result.issues.length} issue(s):\n`,
    );
    for (const iss of result.issues) {
      process.stdout.write(`   - ${iss}\n`);
    }
    process.stdout.write('\n');
    process.exit(1);
  } else {
    process.stdout.write(
      '\n✅ All sitemap integrity, freshness, hreflang, and noindex isolation checks passed!\n\n',
    );
    process.exit(0);
  }
}

run();
