import type {
  BaseGameState,
  GamePlayerState,
} from '../base/game-engine.interface';
import type { PachisiOptions, GamePhase, SeatColor } from './pachisi.constants';

export interface PachisiToken {
  id: number;
  /** -1 = yard, 0..50 = main track, 51..55 = home lane, 56 = finished. */
  progress: number;
}

export interface PachisiPlayer extends GamePlayerState {
  playerId: string;
  seat: number;
  color: SeatColor;
  alive: boolean;
}

export interface MoveTokenPayload {
  tokenId: number;
}

export interface PachisiState extends BaseGameState {
  phase: GamePhase;
  options: PachisiOptions;
  /** playerId -> seat index (0, 13, 26, or 39 start offset / 4). */
  seats: Record<string, number>;
  tokens: Record<string, PachisiToken[]>;
  /** Current rolled die value; null while waiting for a roll. */
  die: number | null;
  consecutiveSixes: number;
  currentTurnIndex: number;
  playerOrder: string[];
  players: PachisiPlayer[];
  /** Primary winner (first of winnerIds); kept for client compatibility. */
  winnerId: string | null;
  /** All winners — forfeit awards every remaining player (hearts semantics). */
  winnerIds: string[];
  isDraw: boolean;
}

export interface InitializeConfig {
  options?: Partial<PachisiOptions>;
}

/** A legal move for the current die roll: move this token. */
export interface LegalMove {
  tokenId: number;
}
