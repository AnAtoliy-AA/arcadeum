import type { BaseGameWidgetProps } from '@/features/games/types/base';

export type CheckersGameProps = BaseGameWidgetProps;

export const BOARD_SIZE = 8;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 2;

export const CHECKERS_VARIANT_IDS = [
  'classic',
  'neon',
  'wood',
  'marble',
  'neon_glow',
] as const;
export type CheckersVariant = (typeof CHECKERS_VARIANT_IDS)[number];

export const RULE_VARIANT_IDS = [
  'american',
  'international',
  'russian',
] as const;
export type RuleVariant = (typeof RULE_VARIANT_IDS)[number];

export interface RuleVariantConfig {
  boardSize: number;
  piecesPerPlayer: number;
  flyingKings: boolean;
  backwardCapturesForMen: boolean;
}

export const RULE_VARIANT_CONFIGS: Record<RuleVariant, RuleVariantConfig> = {
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
  variant: CheckersVariant;
  ruleVariant: RuleVariant;
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
