import type {
  BaseGameState,
  GamePlayerState,
} from '../../base/game-engine.interface';
import type {
  PachisiOptions,
  GamePhase,
  SeatColor,
  TeamId,
} from './pachisi.constants';

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
  /** Team index (0 or 1) when team mode is on, otherwise undefined. */
  team?: TeamId;
}

export interface MoveTokenPayload {
  tokenId: number;
  /** Token owner; only set to move a finished partner's token (team mode). */
  ownerId?: string;
}

export interface PachisiState extends BaseGameState {
  phase: GamePhase;
  options: PachisiOptions;
  /** playerId -> seat index (0, 13, 26, or 39 start offset / 4). */
  seats: Record<string, number>;
  tokens: Record<string, PachisiToken[]>;
  die: number | null;
  lastDie: number | null;
  lastRollerId: string | null;
  consecutiveSixes: number;
  currentTurnIndex: number;
  playerOrder: string[];
  players: PachisiPlayer[];
  /** Primary winner (first of winnerIds); kept for client compatibility. */
  winnerId: string | null;
  /** All winners — forfeit awards every remaining player (hearts semantics). */
  winnerIds: string[];
  isDraw: boolean;
  /** True when 2v2 team rules are active for this match. */
  teamMode?: boolean;
  /** Winning team index once the match ends in team mode. */
  winnerTeam?: TeamId | null;
}

export interface InitializeConfig {
  options?: Partial<PachisiOptions>;
}

/** A legal move for the current die roll: move this token (own, or partner's once own tokens are home). */
export interface LegalMove {
  tokenId: number;
  /** Set only when moving a partner's token (team mode). */
  ownerId?: string;
}
