export interface GameRoomMemberSummary {
  id: string;
  displayName: string;
  username?: string | null;
  email?: string | null;
  isHost: boolean;
}

// Game Options Interface
export interface GameOptions {
  allowActionCardCombos?: boolean;
  idleTimerEnabled?: boolean;
  cardVariant?: string; // e.g. 'cyberpunk', 'underwater', 'crime', 'horror', 'adventure'
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
  | 'collection_alpha'
  | 'collection_beta'
  | 'collection_gamma'
  | 'collection_delta'
  | 'collection_epsilon';

export const CAT_CARDS: CriticalCatCard[] = [
  'collection_alpha',
  'collection_beta',
  'collection_gamma',
  'collection_delta',
  'collection_epsilon',
];

// ===== SPECIAL CARDS (cannot be used in combos) =====
export const SPECIAL_CARDS = ['critical_event', 'neutralizer'] as const;

// ===== BASE GAME CARDS =====
export type BaseActionCard =
  | 'strike'
  | 'evade'
  | 'trade'
  | 'reorder'
  | 'insight'
  | 'cancel';

export const BASE_ACTION_CARDS: BaseActionCard[] = [
  'strike',
  'evade',
  'trade',
  'reorder',
  'insight',
  'cancel',
];

// ===== ATTACK PACK EXPANSION CARDS =====
export type AttackPackCard =
  | 'targeted_strike'
  | 'private_strike'
  | 'recursive_strike'
  | 'mega_evade'
  | 'invert';

export const ATTACK_PACK_CARDS: AttackPackCard[] = [
  'targeted_strike',
  'private_strike',
  'recursive_strike',
  'mega_evade',
  'invert',
];

// ===== COMBINED CARD TYPE =====
export type CriticalCard =
  | 'critical_event'
  | 'neutralizer'
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
