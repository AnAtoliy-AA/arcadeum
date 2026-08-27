import { OFFLINE_GAME_SLUGS } from '@/features/offline/lib/offline-capable';
import { gameMetadata } from '@/features/games/registry';
import type { GameSlug } from '@/features/games/registry.types';

/**
 * Manifest of games that can be explicitly downloaded for offline play.
 *
 * Two families (ARC-900 + puzzle games):
 *  - `bot` — normally-multiplayer games whose shared engines run locally
 *    against bots; playable at `/offline/<slug>`.
 *  - `puzzle` — true single-player games with client-side engines; playable
 *    at `/games/<slug>/play`.
 *
 * Kept dependency-free from engine code so it is safe to import anywhere.
 */
export type DownloadableGameKind = 'bot' | 'puzzle';

export type DownloadableGame = {
  /** Route slug used in the play URL. */
  slug: string;
  /** App-internal path after the locale segment (no leading slash). */
  route: string;
  kind: DownloadableGameKind;
  /** Key into `gameMetadata` for display name/thumbnail. */
  metadataKey: string;
};

const PUZZLE_GAMES: ReadonlyArray<DownloadableGame> = [
  {
    slug: 'solitaire',
    route: 'games/solitaire/play',
    kind: 'puzzle',
    metadataKey: 'solitaire_v1',
  },
  {
    slug: 'minesweeper',
    route: 'games/minesweeper/play',
    kind: 'puzzle',
    metadataKey: 'minesweeper_v1',
  },
  {
    slug: 'sudoku',
    route: 'games/sudoku/play',
    kind: 'puzzle',
    metadataKey: 'sudoku_v1',
  },
  {
    slug: '2048',
    route: 'games/2048/play',
    kind: 'puzzle',
    metadataKey: 'game_2048_v1',
  },
];

export const DOWNLOADABLE_GAMES: ReadonlyArray<DownloadableGame> = [
  ...OFFLINE_GAME_SLUGS.map<DownloadableGame>((entry) => ({
    slug: entry.slug,
    route: `offline/${entry.slug}`,
    kind: 'bot',
    // engineId doubles as the `gameMetadata` key (e.g. 'tic_tac_toe_v1').
    metadataKey: entry.engineId,
  })),
  ...PUZZLE_GAMES,
];

export function findDownloadableGame(slug: string): DownloadableGame | null {
  return DOWNLOADABLE_GAMES.find((g) => g.slug === slug) ?? null;
}

/** Locale-aware URL of the page that must be cached for offline play. */
export function offlineRouteUrl(
  game: DownloadableGame,
  locale: string,
): string {
  return `/${locale}/${game.route}`;
}

/** Display name from the shared game registry (falls back to the slug). */
export function downloadableGameName(game: DownloadableGame): string {
  return gameMetadata[game.metadataKey as GameSlug]?.name ?? game.slug;
}
