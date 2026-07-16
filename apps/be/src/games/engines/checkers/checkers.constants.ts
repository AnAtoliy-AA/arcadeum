export const BOARD_SIZE = 8;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 2;

export const VARIANTS = [
  'classic',
  'neon',
  'wood',
  'marble',
  'neon_glow',
] as const;
export type Variant = (typeof VARIANTS)[number];

export const GAME_PHASE = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
} as const;
export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export const PLAYER_COLORS = ['light', 'dark'] as const;
export type PlayerColor = (typeof PLAYER_COLORS)[number];

export const DEFAULT_OPTIONS = {
  variant: 'classic' as Variant,
  forcedCaptures: true,
};

export const INITIAL_PIECES_PER_PLAYER = 12;
