import type {
  GameRoomSummary,
  ExplodingCatsSnapshot,
  ExplodingCatsCard,
  ExplodingCatsPlayerState,
  ExplodingCatsCatCard,
  ExplodingCatsLogEntry,
  ChatScope,
} from '@/shared/types/games';

/** Number of different cards required for the fiver combo */
export const FIVER_COMBO_SIZE = 5;

/**
 * Props for the ExplodingCatsGame component
 */
export interface ExplodingCatsGameProps {
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
    cat: ExplodingCatsCatCard;
    availableModes: ('pair' | 'trio')[];
  }>;
  selectedCat: ExplodingCatsCatCard | null;
  fiverAvailable: boolean;
}

/**
 * See the future modal state
 */
export interface SeeTheFutureModalState {
  cards: ExplodingCatsCard[];
}

// Re-export shared types for convenience
export type {
  GameRoomSummary,
  ExplodingCatsSnapshot,
  ExplodingCatsCard,
  ExplodingCatsPlayerState,
  ExplodingCatsCatCard,
  ExplodingCatsLogEntry,
  ChatScope,
};

/**
 * List of all cat cards
 */
export const CAT_CARDS: ExplodingCatsCatCard[] = [
  'tacocat',
  'hairy_potato_cat',
  'rainbow_ralphing_cat',
  'cattermelon',
  'bearded_cat',
];

/**
 * List of all game cards
 */
export const ALL_GAME_CARDS: ExplodingCatsCard[] = [
  'exploding_cat',
  'defuse',
  'attack',
  'skip',
  ...CAT_CARDS,
];
