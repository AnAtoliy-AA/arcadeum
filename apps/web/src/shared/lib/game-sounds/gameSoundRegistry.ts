import type { GameSoundId, GameSoundEntry } from './gameSoundTypes';

const CDN = (process.env.NEXT_PUBLIC_CDN_URL || '').replace(/\/+$/, '');
const SOUND_BASE = CDN ? `${CDN}/sounds` : '/sounds';

const SHARED_SOUNDS: Record<string, GameSoundEntry> = {
  click: { file: `${SOUND_BASE}/shared/click.wav`, volume: 0.3 },
  select: { file: `${SOUND_BASE}/shared/select.wav`, volume: 0.25 },
  confirm: { file: `${SOUND_BASE}/shared/confirm.wav`, volume: 0.3 },
  error: { file: `${SOUND_BASE}/shared/error.wav`, volume: 0.3 },
  success: { file: `${SOUND_BASE}/shared/success.wav`, volume: 0.3 },
  notification: { file: `${SOUND_BASE}/shared/ding.wav`, volume: 0.3 },
  open: { file: `${SOUND_BASE}/shared/open.wav`, volume: 0.2 },
  close: { file: `${SOUND_BASE}/shared/close.wav`, volume: 0.2 },
  toggle: { file: `${SOUND_BASE}/shared/toggle.wav`, volume: 0.2 },
  back: { file: `${SOUND_BASE}/shared/back.wav`, volume: 0.2 },
  drop: { file: `${SOUND_BASE}/shared/drop.wav`, volume: 0.25 },
  tick: { file: `${SOUND_BASE}/shared/tick.wav`, volume: 0.15 },
};

const CARD_SOUNDS: Record<string, GameSoundEntry> = {
  deal: { file: `${SOUND_BASE}/cards/deal.wav`, volume: 0.3 },
  flip: { file: `${SOUND_BASE}/cards/slide.wav`, volume: 0.25 },
  play: { file: `${SOUND_BASE}/cards/play.wav`, volume: 0.3 },
  shuffle: { file: `${SOUND_BASE}/cards/shuffle.wav`, volume: 0.2 },
  slide: { file: `${SOUND_BASE}/cards/slide.wav`, volume: 0.2 },
  fan: { file: `${SOUND_BASE}/cards/fan.wav`, volume: 0.2 },
  tap: { file: `${SOUND_BASE}/cards/tap.wav`, volume: 0.25 },
  draw: { file: `${SOUND_BASE}/cards/draw.wav`, volume: 0.3 },
  collect: { file: `${SOUND_BASE}/cards/open.wav`, volume: 0.3 },
};

const BOARD_SOUNDS: Record<string, GameSoundEntry> = {
  move: { file: `${SOUND_BASE}/board/piece-move.wav`, volume: 0.3 },
  capture: { file: `${SOUND_BASE}/board/piece-capture.wav`, volume: 0.35 },
  select_piece: { file: `${SOUND_BASE}/board/piece-select.wav`, volume: 0.2 },
  place: { file: `${SOUND_BASE}/board/piece-place.wav`, volume: 0.3 },
  crown: { file: `${SOUND_BASE}/shared/success.wav`, volume: 0.4 },
};

const DICE_SOUNDS: Record<string, GameSoundEntry> = {
  roll: { file: `${SOUND_BASE}/dice/roll.wav`, volume: 0.35 },
  shake: { file: `${SOUND_BASE}/dice/shake-1.wav`, volume: 0.25 },
  grab: { file: `${SOUND_BASE}/dice/grab.wav`, volume: 0.2 },
};

const BATTLE_SOUNDS: Record<string, GameSoundEntry> = {
  hit: { file: `${SOUND_BASE}/battle/hit.wav`, volume: 0.4 },
  miss: { file: `${SOUND_BASE}/battle/splash-1.wav`, volume: 0.3 },
  explode: { file: `${SOUND_BASE}/battle/explosion.wav`, volume: 0.45 },
  splash: { file: `${SOUND_BASE}/battle/splash-2.wav`, volume: 0.3 },
  sonar: { file: `${SOUND_BASE}/battle/sonar.wav`, volume: 0.3 },
  laser: { file: `${SOUND_BASE}/battle/laser.wav`, volume: 0.3 },
};

const PUZZLE_SOUNDS: Record<string, GameSoundEntry> = {
  reveal: { file: `${SOUND_BASE}/shared/click.wav`, volume: 0.2 },
  place_digit: { file: `${SOUND_BASE}/board/piece-place.wav`, volume: 0.25 },
  slide_tile: { file: `${SOUND_BASE}/cards/slide.wav`, volume: 0.2 },
  merge: { file: `${SOUND_BASE}/shared/success.wav`, volume: 0.3 },
  flag: { file: `${SOUND_BASE}/shared/toggle.wav`, volume: 0.25 },
  card_flip: { file: `${SOUND_BASE}/cards/slide.wav`, volume: 0.25 },
  card_place: { file: `${SOUND_BASE}/cards/place.wav`, volume: 0.3 },
};

const RESULT_SOUNDS: Record<string, GameSoundEntry> = {
  win: { file: `${SOUND_BASE}/result/win.wav`, volume: 0.4 },
  lose: { file: `${SOUND_BASE}/result/lose.wav`, volume: 0.35 },
  game_over: { file: `${SOUND_BASE}/result/game-over.wav`, volume: 0.35 },
};

const CHESS_SOUNDS: Record<string, GameSoundEntry> = {
  chess_move: { file: `${SOUND_BASE}/board/piece-move.wav`, volume: 0.3 },
  chess_capture: {
    file: `${SOUND_BASE}/board/piece-capture.wav`,
    volume: 0.35,
  },
  chess_check: { file: `${SOUND_BASE}/shared/ding.wav`, volume: 0.35 },
  chess_castle: { file: `${SOUND_BASE}/board/piece-move.wav`, volume: 0.3 },
  chess_promotion: { file: `${SOUND_BASE}/shared/success.wav`, volume: 0.4 },
  chess_game_start: { file: `${SOUND_BASE}/shared/confirm.wav`, volume: 0.3 },
  chess_game_end: { file: `${SOUND_BASE}/result/game-over.wav`, volume: 0.35 },
  chess_draw_offer: { file: `${SOUND_BASE}/shared/question.wav`, volume: 0.3 },
  chess_notification: { file: `${SOUND_BASE}/shared/ding.wav`, volume: 0.3 },
  chess_error: { file: `${SOUND_BASE}/shared/error.wav`, volume: 0.3 },
};

const ALL_SOUNDS: Record<string, GameSoundEntry> = {
  ...SHARED_SOUNDS,
  ...CARD_SOUNDS,
  ...BOARD_SOUNDS,
  ...DICE_SOUNDS,
  ...BATTLE_SOUNDS,
  ...PUZZLE_SOUNDS,
  ...RESULT_SOUNDS,
  ...CHESS_SOUNDS,
};

/** Per-game sound type composition */
export const GAME_SOUND_TYPES: Record<string, readonly GameSoundId[]> = {
  // Solo puzzles
  solitaire_v1: ['card_flip', 'card_place', 'click', 'win', 'lose'],
  minesweeper_v1: ['click', 'reveal', 'flag', 'explode', 'win', 'lose'],
  sudoku_v1: ['click', 'place_digit', 'toggle', 'win'],
  game_2048_v1: ['slide_tile', 'merge', 'click', 'win', 'lose'],
  // Card games
  hearts_v1: [
    'deal',
    'play',
    'shuffle',
    'collect',
    'notification',
    'win',
    'lose',
  ],
  spades_v1: [
    'deal',
    'play',
    'shuffle',
    'collect',
    'notification',
    'error',
    'win',
    'lose',
  ],
  cascade_v1: [
    'deal',
    'play',
    'shuffle',
    'draw',
    'notification',
    'error',
    'win',
    'lose',
  ],
  critical_v1: ['deal', 'play', 'hit', 'notification', 'error', 'win', 'lose'],
  // Board games
  chess_v1: [
    'chess_move',
    'chess_capture',
    'chess_check',
    'chess_castle',
    'chess_promotion',
    'chess_game_start',
    'chess_game_end',
    'chess_draw_offer',
    'chess_notification',
    'chess_error',
  ],
  checkers_v1: ['move', 'capture', 'select_piece', 'crown', 'win', 'lose'],
  backgammon_v1: [
    'roll',
    'shake',
    'move',
    'capture',
    'notification',
    'win',
    'lose',
  ],
  go_v1: ['place', 'capture', 'click', 'notification'],
  pachisi_v1: ['roll', 'shake', 'move', 'capture', 'success', 'win', 'lose'],
  tic_tac_toe_v1: ['place', 'click', 'win', 'lose'],
  // Strategy
  sea_battle_v1: [
    'hit',
    'miss',
    'explode',
    'splash',
    'sonar',
    'notification',
    'win',
    'lose',
  ],
  // Action
  glimworm_v1: ['click', 'hit', 'notification', 'tick', 'win', 'lose'],
  cat_dash_v1: ['roll', 'move', 'capture', 'success', 'win', 'lose'],
};

export function getSoundEntry(
  soundId: GameSoundId,
): GameSoundEntry | undefined {
  return ALL_SOUNDS[soundId];
}

export function getGameSounds(gameId: string): readonly GameSoundId[] {
  return GAME_SOUND_TYPES[gameId] ?? [];
}
