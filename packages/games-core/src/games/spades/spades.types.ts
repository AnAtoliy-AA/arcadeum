import type {
  BaseGameState,
  GamePlayerState,
} from '../../base/game-engine.interface';
import type { GamePhase, SpadesOptions, Suit } from './spades.constants';

export interface TrickPlay {
  playerId: string;
  card: string;
}

export interface CurrentTrick {
  plays: TrickPlay[];
  leadSuit: Suit | null;
}

export interface SpadesPlayer extends GamePlayerState {
  playerId: string;
}

/** Per-hand scoring breakdown surfaced to the UI after each hand. */
export interface HandSummary {
  handNumber: number;
  teamBids: Record<string, number>;
  teamTricks: Record<string, number>;
  pointsDelta: Record<string, number>;
  nilResults: Array<{ playerId: string; success: boolean }>;
}

export interface SpadesState extends BaseGameState {
  phase: GamePhase;
  options: SpadesOptions;
  handNumber: number;
  hands: Record<string, string[]>;
  /** Cards from tricks this player's seat won during the current hand. */
  taken: Record<string, string[]>;
  /** `null` = not yet bid this hand; `0` = Nil bid. */
  bids: Record<string, number | null>;
  scores: Record<string, number>;
  /** Team-level sandbag counter mirrored onto both partners. */
  bags: Record<string, number>;
  currentTrick: CurrentTrick;
  currentTurnIndex: number;
  playerOrder: string[];
  players: SpadesPlayer[];
  spadesBroken: boolean;
  lastHandSummary: HandSummary | null;
  winnerIds: string[] | null;
  isDraw: boolean;
}

export interface BidPayload {
  amount: number;
}

export interface PlayCardPayload {
  card: string;
}

export interface InitializeConfig {
  options?: Partial<SpadesOptions>;
}
