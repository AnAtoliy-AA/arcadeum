import type {
  BaseGameState,
  GamePlayerState,
} from '../base/game-engine.interface';
import type { GamePhase, PlayerColor, Variant } from './checkers.constants';

export interface CheckersOptions {
  variant: Variant;
  forcedCaptures: boolean;
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
  forcedCaptureChain: MoveStep[] | null;
}

export interface InitializeConfig {
  options?: Partial<CheckersOptions>;
}
