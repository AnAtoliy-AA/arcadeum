import {
  GameRoomSummary,
  CriticalSnapshot,
  CriticalCard,
  CriticalPlayerState,
  CriticalCatCard,
  CriticalLogEntry,
  ChatScope,
  ATTACK_PACK_CARDS,
  BASE_ACTION_CARDS,
  CAT_CARDS,
  SPECIAL_CARDS,
  FUTURE_PACK_CARDS,
  THEFT_PACK_CARDS,
  MarkedCardInfo,
  DEITY_PACK_CARDS,
} from '@/shared/types/games';

/** Number of different cards required for the fiver combo */
export const FIVER_COMBO_SIZE = 5;

/**
 * Props for the CriticalGame component
 */
export interface CriticalGameProps {
  roomId: string;
  room: GameRoomSummary;
  session: unknown | null;
  currentUserId: string | null;
  isHost: boolean;
  onPostHistoryNote?: (message: string, scope: 'all' | 'players') => void;
  config?: unknown;
  accessToken?: string | null;
}

/**
 * Cat combo modal state
 */
export interface CatComboModalState {
  availableCats: Array<{
    cat: CriticalCatCard;
    availableModes: ('pair' | 'trio')[];
  }>;
  selectedCat: CriticalCatCard | null;
  fiverAvailable: boolean;
}

/**
 * See the future modal state
 */
export interface SeeTheFutureModalState {
  cards: CriticalCard[];
}

/**
 * Alter the future modal state
 */
export interface AlterTheFutureModalState {
  cards: CriticalCard[];
  count: number;
  isShare: boolean;
}

/**
 * Omniscience modal state
 */
export interface OmniscienceModalState {
  hands: Array<{
    playerId: string;
    cards: CriticalCard[];
  }>;
}

// Re-export shared types for convenience
export type {
  GameRoomSummary,
  CriticalSnapshot,
  CriticalCard,
  CriticalPlayerState,
  CriticalCatCard,
  CriticalLogEntry,
  ChatScope,
  MarkedCardInfo,
};

export {
  ATTACK_PACK_CARDS,
  BASE_ACTION_CARDS,
  CAT_CARDS,
  SPECIAL_CARDS,
  FUTURE_PACK_CARDS,
  THEFT_PACK_CARDS,
  DEITY_PACK_CARDS,
};

/**
 * List of all game cards
 */
export const ALL_GAME_CARDS: CriticalCard[] = [
  ...SPECIAL_CARDS,
  ...BASE_ACTION_CARDS,
  ...CAT_CARDS,
  ...ATTACK_PACK_CARDS,
  ...FUTURE_PACK_CARDS,
  ...THEFT_PACK_CARDS,
  ...DEITY_PACK_CARDS,
];

export type HandLayoutMode =
  | 'grid'
  | 'grid-3'
  | 'grid-4'
  | 'grid-5'
  | 'grid-6'
  | 'linear';

export interface PendingAction {
  type: string;
  playerId: string;
  payload?: unknown;
  nopeCount: number;
}

export interface PendingFavor {
  requesterId: string;
  targetId: string;
}
