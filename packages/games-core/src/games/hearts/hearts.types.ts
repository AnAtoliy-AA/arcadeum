import type {
  BaseGameState,
  GamePlayerState,
} from '../../base/game-engine.interface';
import type {
  GamePhase,
  HeartsOptions,
  PassDirection,
  Suit,
} from './hearts.constants';

export interface TrickPlay {
  playerId: string;
  card: string;
}

export interface CurrentTrick {
  plays: TrickPlay[];
  leadSuit: Suit | null;
}

export interface HeartsPlayer extends GamePlayerState {
  playerId: string;
}

export interface HeartsState extends BaseGameState {
  phase: GamePhase;
  options: HeartsOptions;
  handNumber: number;
  passDirection: PassDirection;
  hands: Record<string, string[]>;
  /** Cards each player collected during the current hand. */
  taken: Record<string, string[]>;
  /** Cards selected for passing but not yet resolved. */
  pendingPasses: Record<string, string[]>;
  scores: Record<string, number>;
  handScores: Record<string, number>;
  currentTrick: CurrentTrick;
  currentTurnIndex: number;
  playerOrder: string[];
  players: HeartsPlayer[];
  heartsBroken: boolean;
  winnerIds: string[] | null;
  winType: 'standard' | 'shoot_the_moon' | null;
  isDraw: boolean;
}

export interface PassCardsPayload {
  cards: string[];
}

export interface PlayCardPayload {
  card: string;
}

export interface InitializeConfig {
  options?: Partial<HeartsOptions>;
}
