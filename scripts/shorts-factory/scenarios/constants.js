'use strict';

/**
 * Formats the daily gameplay short can take.
 *  - bot_match:        classic recorded match vs AI (the original format)
 *  - puzzle:           "can you find the winning move?" with a countdown + reveal
 *  - guess_the_move:   pause on a position, ask the viewer, then reveal
 *  - comeback:         replay highlight where the winner was losing
 *  - last_second_win:  replay highlight where the win came on the final move
 *  - replay_highlight: replay highlight on a capture / big combo
 */
const FORMATS = [
  'bot_match',
  'puzzle',
  'guess_the_move',
  'comeback',
  'last_second_win',
  'replay_highlight',
];

/** Formats that need real replay data from the backend. */
const REPLAY_FORMATS = new Set([
  'comeback',
  'last_second_win',
  'replay_highlight',
]);

/** Formats that need puzzle data (API or bundled fallback). */
const PUZZLE_FORMATS = new Set(['puzzle', 'guess_the_move']);

/** Game name (gameplay.js GAMES[].name) -> backend gameId used by replays. */
const GAME_IDS = {
  'sea-battle': 'sea_battle_v1',
  chess: 'chess_v1',
  checkers: 'checkers_v1',
  'tic-tac-toe': 'tic_tac_toe_v1',
  cascade: 'cascade_v1',
  critical: 'critical_v1',
  backgammon: 'backgammon_v1',
  hearts: 'hearts_v1',
  go: 'go_v1',
  glimworm: 'glimworm_v1',
  'cat-dash': 'cat_dash_v1',
  'texas-holdem': 'texas_holdem_v1',
  spades: 'spades_v1',
  pachisi: 'pachisi_v1',
  2048: '2048_v1',
};

/** Games that have a puzzle source today. */
const PUZZLE_GAMES = new Set(['chess']);

const THEMES = [
  { id: 'default', name: 'Classic' },
  { id: 'cyberpunk', name: 'Cyberpunk' },
  { id: 'underwater', name: 'Underwater' },
  { id: 'galaxy', name: 'Galaxy' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'steampunk', name: 'Steampunk' },
  { id: 'zen', name: 'Zen' },
];

const CAPTURE = {
  width: 1080,
  height: 1920,
};

module.exports = {
  FORMATS,
  REPLAY_FORMATS,
  PUZZLE_FORMATS,
  GAME_IDS,
  PUZZLE_GAMES,
  THEMES,
  CAPTURE,
};
