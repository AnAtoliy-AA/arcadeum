export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;

export const BOARD_SIZES = [3, 5, 7, 9] as const;
export type BoardSize = (typeof BOARD_SIZES)[number];

export const WIN_LENGTH: Record<BoardSize, 3 | 4 | 5> = {
  3: 3,
  5: 4,
  7: 5,
  9: 5,
};

export const VARIANTS = [
  'classic',
  'neon',
  'paper',
  'pixel',
  'chalkboard',
  'retro',
] as const;
export type Variant = (typeof VARIANTS)[number];

export const GAME_PHASE = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
} as const;
export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export const PLAYER_SYMBOLS = ['X', 'O', '△', '□'] as const;

export const TEAM_PRESETS = [
  { id: 'red', name: 'Red', color: '#ef4444' },
  { id: 'blue', name: 'Blue', color: '#3b82f6' },
] as const;

export const DEFAULT_OPTIONS = {
  variant: 'classic' as Variant,
  boardSize: 3 as BoardSize,
  teamMode: false,
};
