import type { BaseGameWidgetProps } from '@/features/games/types/base';

export type CheckersGameProps = BaseGameWidgetProps;

export const BOARD_SIZE = 8;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 2;

export const CHECKERS_THEME_IDS = [
  'cyberpunk',
  'underwater',
  'crime',
  'horror',
  'adventure',
  'high-altitude-hike',
  'galaxy',
  'fantasy',
  'western',
  'egypt',
  'steampunk',
  'zen',
] as const;
export type CheckersTheme = (typeof CHECKERS_THEME_IDS)[number];

export const MODE_IDS = ['american', 'international', 'russian'] as const;
export type Mode = (typeof MODE_IDS)[number];

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

export type PlayerColor = 'light' | 'dark';
export type PieceType = 'man' | 'king';

export interface Piece {
  playerId: string;
  type: PieceType;
}

export type Board = (Piece | null)[][];

export interface CheckersPlayer {
  playerId: string;
  color: PlayerColor;
  alive: boolean;
  piecesRemaining: number;
}

export interface MoveStep {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  capturedRow?: number;
  capturedCol?: number;
}

export interface CheckersOptions {
  theme: CheckersTheme;
  variant?: CheckersTheme;
  mode: Mode;
  forcedCaptures: boolean;
  backwardCaptures: boolean;
}

export interface CheckersLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  scope?: 'all' | 'players' | 'private' | 'team';
  senderId?: string | null;
  senderName?: string | null;
  targetId?: string | null;
}

export interface CheckersClientState {
  phase: GamePhase;
  options: CheckersOptions;
  board: Board;
  currentTurnIndex: number;
  playerOrder: string[];
  players: CheckersPlayer[];
  winnerId: string | null;
  isDraw: boolean;
  forcedCaptureChain: MoveStep[] | null;
  logs: CheckersLogEntry[];
}
