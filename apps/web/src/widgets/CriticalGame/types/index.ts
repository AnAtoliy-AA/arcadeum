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

// Re-export shared types for convenience
export type {
  GameRoomSummary,
  CriticalSnapshot,
  CriticalCard,
  CriticalPlayerState,
  CriticalCatCard,
  CriticalLogEntry,
  ChatScope,
};

export { ATTACK_PACK_CARDS, BASE_ACTION_CARDS, CAT_CARDS, SPECIAL_CARDS };

/**
 * List of all game cards
 */
export const ALL_GAME_CARDS: CriticalCard[] = [
  ...SPECIAL_CARDS,
  ...BASE_ACTION_CARDS,
  ...CAT_CARDS,
  ...ATTACK_PACK_CARDS,
];
