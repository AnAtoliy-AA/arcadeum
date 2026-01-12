export interface GameRoomMemberSummary {
  id: string;
  displayName: string;
  username?: string | null;
  email?: string | null;
  isHost: boolean;
}

export interface GameOptions {
  allowActionCardCombos?: boolean;
  idleTimerEnabled?: boolean;
  rematchInvitedUsers?: { id: string; displayName: string }[];
  rematchDeclinedUsers?: { id: string; displayName: string }[];
  rematchInvitedIds?: string[];
  rematchDeclinedIds?: string[];
  rematchPreviousRoomId?: string;
  rematchMessage?: string;
  [key: string]: unknown;
}

export interface GameRoomSummary {
  id: string;
  gameId: string;
  name: string;
  hostId: string;
  visibility: 'public' | 'private';
  playerCount: number;
  maxPlayers: number | null;
  createdAt: string;
  status: 'lobby' | 'in_progress' | 'completed';
  inviteCode?: string;
  gameOptions?: GameOptions;
  rematchInvitedUsers?: GameRoomMemberSummary[];
  rematchDeclinedUsers?: GameRoomMemberSummary[];
  host?: GameRoomMemberSummary;
  members?: GameRoomMemberSummary[];
}

export interface GameSessionSummary {
  id: string;
  roomId: string;
  gameId: string;
  engine: string;
  status: 'waiting' | 'active' | 'completed';
  state: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ===== CAT CARDS (for combos) =====
export type CriticalCatCard =
  | 'tacocat'
  | 'hairy_potato_cat'
  | 'rainbow_ralphing_cat'
  | 'cattermelon'
  | 'bearded_cat';

export const CAT_CARDS: CriticalCatCard[] = [
  'tacocat',
  'hairy_potato_cat',
  'rainbow_ralphing_cat',
  'cattermelon',
  'bearded_cat',
];

// ===== SPECIAL CARDS (cannot be used in combos) =====
export const SPECIAL_CARDS = ['exploding_cat', 'defuse'] as const;

// ===== BASE GAME CARDS =====
export type BaseActionCard =
  | 'attack'
  | 'skip'
  | 'favor'
  | 'shuffle'
  | 'see_the_future'
  | 'nope';

export const BASE_ACTION_CARDS: BaseActionCard[] = [
  'attack',
  'skip',
  'favor',
  'shuffle',
  'see_the_future',
  'nope',
];

// ===== ATTACK PACK EXPANSION CARDS =====
export type AttackPackCard =
  | 'targeted_attack'
  | 'personal_attack'
  | 'attack_of_the_dead'
  | 'super_skip'
  | 'reverse';

export const ATTACK_PACK_CARDS: AttackPackCard[] = [
  'targeted_attack',
  'personal_attack',
  'attack_of_the_dead',
  'super_skip',
  'reverse',
];

// ===== COMBINED CARD TYPE =====
export type CriticalCard =
  | 'exploding_cat'
  | 'defuse'
  | BaseActionCard
  | CriticalCatCard
  | AttackPackCard;

export interface CriticalPlayerState {
  playerId: string;
  hand: CriticalCard[];
  alive: boolean;
}

// ===== SHARED TYPES =====
export type ChatScope = 'all' | 'players' | 'private';

export interface CriticalLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  senderId?: string | null;
  senderName?: string | null;
  scope?: ChatScope;
}

export interface CriticalSnapshot {
  deck: CriticalCard[];
  discardPile: CriticalCard[];
  playerOrder: string[];
  currentTurnIndex: number;
  pendingDraws: number;
  pendingDefuse: string | null; // Player ID who must play defuse, null if none
  pendingFavor: {
    requesterId: string;
    targetId: string;
  } | null; // Pending favor request, null if none
  pendingAction: {
    type: string;
    playerId: string;
    payload?: unknown;
    nopeCount: number;
  } | null; // Action that can be noped
  players: CriticalPlayerState[];
  logs: CriticalLogEntry[];
  allowActionCardCombos: boolean; // House rule: allow any matching cards for combos
}

// Texas Hold'em types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type BettingRound = 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';

export type PlayerAction =
  | 'fold'
  | 'check'
  | 'call'
  | 'raise'
  | 'all-in'
  | 'waiting';

export interface TexasHoldemPlayerState {
  playerId: string;
  chips: number;
  hand: Card[];
  currentBet: number;
  totalBet: number;
  folded: boolean;
  allIn: boolean;
  lastAction?: PlayerAction;
}

export interface TexasHoldemLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  senderId?: string | null;
  senderName?: string | null;
  scope?: ChatScope;
}

export interface TexasHoldemSnapshot {
  deck: Card[];
  communityCards: Card[];
  pot: number;
  sidePots: Array<{ amount: number; eligiblePlayers: string[] }>;
  playerOrder: string[];
  dealerIndex: number;
  currentTurnIndex: number;
  bettingRound: BettingRound;
  currentBet: number;
  players: TexasHoldemPlayerState[];
  logs: TexasHoldemLogEntry[];
  lastToRaise: number | null;
  roundComplete: boolean;
}
