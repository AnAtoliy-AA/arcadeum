import type {
  BaseGameState,
  GamePlayerState,
} from '../base/game-engine.interface';
import type {
  ActiveColor,
  CardColor,
  CardKind,
  Direction,
  GamePhase,
  Mode,
  PendingAction,
  Variant,
} from './cascade.constants';

export interface CascadeCard {
  /** Unique runtime id used to address a card in a player's hand. */
  id: string;
  color: CardColor | 'W';
  kind: CardKind;
  /** Set only for NUMBER cards. */
  value?: number;
}

export interface CascadeOptions {
  variant: Variant;
  /**
   * Gameplay mode — selects rule preset. `stackingEnabled` is derived from
   * mode at engine-init time (classic/speed: ON, pure: OFF), but is also
   * kept on state for clients to read.
   */
  mode: Mode;
  stackingEnabled: boolean;
  /**
   * Whether the Last-Card race is active. When true and a player drops to
   * one card, every alive player can press Cascade — first press wins.
   */
  lastCardCallEnabled: boolean;
}

/**
 * Open Last-Card race window. While non-null, every alive player may emit
 * `call_cascade`. First call wins (server processes actions serially).
 * Cleared when the at-risk player takes their next turn or when any call
 * resolves it.
 */
export interface LastCardWindow {
  playerId: string;
  openedAt: string;
}

export interface CascadePlayer extends GamePlayerState {
  playerId: string;
  alive: boolean;
  hand: CascadeCard[];
}

export interface CascadeState extends BaseGameState {
  phase: GamePhase;
  options: CascadeOptions;

  players: CascadePlayer[];
  playerOrder: string[];
  currentTurnIndex: number;
  direction: Direction;

  drawPile: CascadeCard[];
  discardPile: CascadeCard[];
  /** Top of the discard pile, replicated for cheap reads. */
  topCard: CascadeCard;
  /** Currently active color — overridden by Wild plays. */
  activeColor: ActiveColor;

  /**
   * When > 0, the next player must either draw `pendingDraw` cards (and lose
   * their turn) OR play a same-kind stack card to pass it along + 2/+4 more.
   * Stack kind tracks which card kind started the chain so cross-stacking
   * (D2 onto WD4 or vice versa) is rejected.
   */
  pendingDraw: number;
  pendingStackKind: 'DRAW_TWO' | 'WILD_DRAW_FOUR' | null;

  /**
   * When non-NONE the current player owes the engine a follow-up action
   * (typically: name the active color after playing a wild).
   */
  pendingAction: PendingAction;

  /**
   * Active Last-Card race, if any. Only one window at a time is supported:
   * a second player going to 1 card while a window is open closes the old
   * one safely and opens a new one for the new at-risk player.
   */
  lastCardWindow: LastCardWindow | null;

  winnerId: string | null;
}

export interface PlayCardPayload {
  cardId: string;
  /** Required when the card kind is WILD or WILD_DRAW_FOUR. */
  chosenColor?: ActiveColor;
}

export interface NameColorPayload {
  color: ActiveColor;
}

export interface InitializeConfig {
  options?: Partial<CascadeOptions>;
}
