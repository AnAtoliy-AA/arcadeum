export const BOARD_SIZE = 8;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 2;

export const MODES = ['american', 'international', 'russian'] as const;
export type Mode = (typeof MODES)[number];

export interface ModeConfig {
  boardSize: number;
  piecesPerPlayer: number;
  flyingKings: boolean;
  backwardCapturesForMen: boolean;
}

export const MODE_CONFIGS: Record<Mode, ModeConfig> = {
  american: {
    boardSize: 8,
    piecesPerPlayer: 12,
    flyingKings: false,
    backwardCapturesForMen: false,
  },
  international: {
    boardSize: 10,
    piecesPerPlayer: 20,
    flyingKings: true,
    backwardCapturesForMen: true,
  },
  russian: {
    boardSize: 8,
    piecesPerPlayer: 8,
    flyingKings: true,
    backwardCapturesForMen: false,
  },
};

export const GAME_PHASE = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
} as const;
export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export const PLAYER_COLORS = ['light', 'dark'] as const;
export type PlayerColor = (typeof PLAYER_COLORS)[number];

export const DEFAULT_OPTIONS = {
  theme: 'adventure',
  mode: 'american' as Mode,
  forcedCaptures: true,
  backwardCaptures: false,
  botDifficulty: 'medium' as const,
};

export const INITIAL_PIECES_PER_PLAYER = 12;
