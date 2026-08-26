import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SERVER_APP = join(ROOT, '.next/server/app');
const STATIC_DIR = join(ROOT, '.next');
const OUT_FILE = join(ROOT, 'public/game-sizes.json');

/**
 * Extracts chunk file paths referenced in a Turbopack client-reference manifest.
 * Returns paths relative to `.next/static/` (e.g. "static/chunks/abc.js").
 */
function chunksFromManifest(manifestPath) {
  try {
    const raw = readFileSync(manifestPath, 'utf8');
    const matches = raw.matchAll(/static\/chunks\/[a-zA-Z0-9_.-]+\.js/g);
    return [...new Set([...matches].map((m) => m[0]))];
  } catch {
    return [];
  }
}

function sumChunkBytes(chunks) {
  let total = 0;
  for (const rel of chunks) {
    try {
      total += statSync(join(STATIC_DIR, rel)).size;
    } catch {
      /* missing chunk — skip */
    }
  }
  return total;
}

/**
 * Resolves the internal route directory for a bot-mode offline game.
 * The dynamic route lives at `[locale]/(app)/offline/[game]/`.
 */
function offlineManifestPath() {
  return join(
    SERVER_APP,
    '[locale]',
    '(app)',
    'offline',
    '[game]',
    'page_client-reference-manifest.js',
  );
}

/**
 * Resolves the internal route directory for a puzzle play page.
 * e.g. `[locale]/(app)/games/solitaire/play/`.
 */
function puzzleManifestPath(slug) {
  const dir = slug === '2048' ? '2048' : slug;
  return join(
    SERVER_APP,
    '[locale]',
    '(app)',
    'games',
    dir,
    'play',
    'page_client-reference-manifest.js',
  );
}

/**
 * Resolves the landing-page manifest for a bot-mode game (used to extract
 * game-specific widget chunks that aren't in the offline route manifest).
 */
function landingManifestPath(slug) {
  return join(
    SERVER_APP,
    '[locale]',
    '(app)',
    'games',
    slug,
    'page_client-reference-manifest.js',
  );
}

function main() {
  // 1. Base chunks shared by all offline bot-mode games (layout + offline view).
  const offlineChunks = new Set(chunksFromManifest(offlineManifestPath()));
  const baseBytes = sumChunkBytes([...offlineChunks]);

  // 2. Bot-mode games: base + game-specific widget chunks from landing pages.
  const BOT_GAMES = [
    'chess',
    'checkers',
    'backgammon',
    'hearts',
    'spades',
    'cascade',
    'tic-tac-toe',
    'go',
    'pachisi',
    'sea-battle',
    'critical',
    'cat-dash',
  ];

  const gameSizes = {};

  for (const slug of BOT_GAMES) {
    const allChunks = chunksFromManifest(landingManifestPath(slug));
    const gameSpecific = allChunks.filter((c) => !offlineChunks.has(c));
    gameSizes[slug] = baseBytes + sumChunkBytes(gameSpecific);
  }

  // 3. Puzzle games: full route chunks (includes statically imported widgets).
  const PUZZLE_SLUGS = ['solitaire', 'minesweeper', 'sudoku', '2048'];

  for (const slug of PUZZLE_SLUGS) {
    const chunks = chunksFromManifest(puzzleManifestPath(slug));
    gameSizes[slug] = sumChunkBytes(chunks);
  }

  // 4. Total unique bytes across all games (union of all chunk sets).
  const allUniqueChunks = new Set(offlineChunks);
  for (const slug of BOT_GAMES) {
    for (const c of chunksFromManifest(landingManifestPath(slug))) {
      allUniqueChunks.add(c);
    }
  }
  for (const slug of PUZZLE_SLUGS) {
    for (const c of chunksFromManifest(puzzleManifestPath(slug))) {
      allUniqueChunks.add(c);
    }
  }
  const totalBytes = sumChunkBytes([...allUniqueChunks]);

  const manifest = { games: gameSizes, totalBytes };
  writeFileSync(OUT_FILE, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(
    `[generate-game-sizes] wrote ${OUT_FILE} — ${Object.keys(gameSizes).length} games, ${(totalBytes / 1024).toFixed(0)} KB total unique`,
  );
}

main();
