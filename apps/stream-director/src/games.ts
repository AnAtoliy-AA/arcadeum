import type { GameConfig } from './types';

/**
 * Rotation config for Phase 1 (bot vs bot only).
 *
 * Mirrors AI_VS_AI_GAME_IDS in apps/be/src/games/common/ai-vs-ai.ts.
 * Excluded on purpose: texas_holdem_v1 (no bot service), glimworm_v1
 * (real-time engine, no per-move delay).
 *
 * Bot DIFFICULTY is not part of the AI-vs-AI request: the BE picks it from
 * the game's own settings, so there is no difficulty knob here.
 */

const MIN = 60_000;

const DEFAULT_THEMES = [
  'adventure',
  'cyberpunk',
  'underwater',
  'galaxy',
  'fantasy',
  'steampunk',
  'zen',
  'western',
  'egypt',
];

type GameSeed = Pick<GameConfig, 'id' | 'title' | 'maxDurationMs'>;

const SEEDS: GameSeed[] = [
  { id: 'chess_v1', title: 'Chess', maxDurationMs: 14 * MIN },
  { id: 'checkers_v1', title: 'Checkers', maxDurationMs: 10 * MIN },
  { id: 'tic_tac_toe_v1', title: 'Tic-Tac-Toe', maxDurationMs: 3 * MIN },
  { id: 'cascade_v1', title: 'Cascade', maxDurationMs: 8 * MIN },
  { id: 'critical_v1', title: 'Critical', maxDurationMs: 10 * MIN },
  { id: 'sea_battle_v1', title: 'Sea Battle', maxDurationMs: 10 * MIN },
  { id: 'cat_dash_v1', title: 'Cat Dash', maxDurationMs: 8 * MIN },
  { id: 'backgammon_v1', title: 'Backgammon', maxDurationMs: 12 * MIN },
  { id: 'hearts_v1', title: 'Hearts', maxDurationMs: 12 * MIN },
  { id: 'spades_v1', title: 'Spades', maxDurationMs: 12 * MIN },
  { id: 'go_v1', title: 'Go', maxDurationMs: 14 * MIN },
  { id: 'pachisi_v1', title: 'Pachisi', maxDurationMs: 14 * MIN },
];

export const GAMES: GameConfig[] = SEEDS.map((g) => ({
  weight: 1,
  moveDelayMs: 2000,
  stuckMs: 2 * MIN,
  themes: DEFAULT_THEMES,
  personalities: null,
  ...g,
}));

export const EXCLUDED_GAME_IDS = ['texas_holdem_v1', 'glimworm_v1'];
/** The BE accepts any bot move delay in this range (admin setting). */
export const MIN_DELAY_MS = 500;
export const MAX_DELAY_MS = 8000;

/** Validate a rotation config. Returns a list of problems (empty = ok). */
export function validateGames(games: GameConfig[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  if (!Array.isArray(games) || games.length < 2) {
    problems.push('need at least 2 games so the same game never repeats');
  }
  for (const g of games ?? []) {
    if (seen.has(g.id)) problems.push(`duplicate game ${g.id}`);
    seen.add(g.id);
    if (EXCLUDED_GAME_IDS.includes(g.id)) {
      problems.push(`${g.id} is not supported`);
    }
    if (!(g.moveDelayMs >= MIN_DELAY_MS && g.moveDelayMs <= MAX_DELAY_MS)) {
      problems.push(
        `${g.id}: moveDelayMs must be ${MIN_DELAY_MS}-${MAX_DELAY_MS}`,
      );
    }
    if (!(g.maxDurationMs > 0))
      problems.push(`${g.id}: maxDurationMs required`);
    if (!Array.isArray(g.themes) || !g.themes.length) {
      problems.push(`${g.id}: themes required`);
    }
  }
  return problems;
}
