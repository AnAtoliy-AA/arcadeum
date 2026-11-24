'use strict';

/**
 * Rotation config for Phase 1 (bot vs bot only).
 *
 * Mirrors AI_VS_AI_GAME_IDS in apps/be/src/games/common/ai-vs-ai.ts.
 * Excluded on purpose: texas_holdem_v1 (no bot service), glimworm_v1
 * (real-time engine, no per-move delay).
 *
 * Per-game settings:
 *  - title:        label used for logs and the idle scene
 *  - maxDurationMs: hard cap. Past it the room is abandoned and we move on.
 *  - stuckMs:      no state change for this long counts as stuck.
 *  - moveDelayMs:  bot move delay, one of 1000 / 2000 / 5000 (BE enum).
 *  - themes:       visual themes rotated per game (BE falls back to
 *                  "adventure" for unknown values).
 *  - personalities: optional [white, black] bot personality ids. The BE
 *                  picks them at random when omitted. Bot DIFFICULTY is not
 *                  part of the AI-vs-AI contract: the BE picks it from the
 *                  game's own settings, so there is no difficulty knob here.
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

const GAMES = [
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
].map((g) => ({
  moveDelayMs: 2000,
  stuckMs: 2 * MIN,
  themes: DEFAULT_THEMES,
  personalities: null,
  ...g,
}));

const EXCLUDED_GAME_IDS = ['texas_holdem_v1', 'glimworm_v1'];
const ALLOWED_DELAYS_MS = [1000, 2000, 5000];

/** Validate a rotation config. Returns a list of problems (empty = ok). */
function validateGames(games) {
  const problems = [];
  const seen = new Set();
  if (!Array.isArray(games) || games.length < 2) {
    problems.push('need at least 2 games so the same game never repeats');
  }
  for (const g of games || []) {
    if (seen.has(g.id)) problems.push(`duplicate game ${g.id}`);
    seen.add(g.id);
    if (EXCLUDED_GAME_IDS.includes(g.id))
      problems.push(`${g.id} is not supported`);
    if (!ALLOWED_DELAYS_MS.includes(g.moveDelayMs)) {
      problems.push(
        `${g.id}: moveDelayMs must be one of ${ALLOWED_DELAYS_MS.join('/')}`,
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

module.exports = { GAMES, EXCLUDED_GAME_IDS, ALLOWED_DELAYS_MS, validateGames };
