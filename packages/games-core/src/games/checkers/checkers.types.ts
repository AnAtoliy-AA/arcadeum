import type {
  BaseGameState,
  GamePlayerState,
} from '../../base/game-engine.interface';
import type {
  GamePhase,
  PlayerColor,
  Mode,
} from './checkers.constants';
import type { AiDifficulty } from '../../lib/ai-difficulty';

export interface CheckersOptions {
  theme: string;
  variant?: string;
  mode: Mode;
  forcedCaptures: boolean;
  backwardCaptures: boolean;
  botDifficulty?: AiDifficulty;
}

export type PieceType = 'man' | 'king';
export type CellOwner = string | null;

export interface Piece {
  playerId: string;
  type: PieceType;
}

export type Board = (Piece | null)[][];

export interface CheckersPlayer extends GamePlayerState {
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

export interface MovePayload {
  steps: MoveStep[];
}

export interface CheckersState extends BaseGameState {
  phase: GamePhase;
  options: CheckersOptions;
  board: Board;
  currentTurnIndex: number;
  playerOrder: string[];
  players: CheckersPlayer[];
  winnerId: string | null;
  isDraw: boolean;
}

export interface InitializeConfig {
  options?: Partial<CheckersOptions>;
}
