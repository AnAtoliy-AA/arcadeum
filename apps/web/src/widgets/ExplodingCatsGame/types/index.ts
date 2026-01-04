import type {
  GameRoomSummary,
  ExplodingCatsSnapshot,
  ExplodingCatsCard,
  ExplodingCatsPlayerState,
  ExplodingCatsCatCard,
  ChatScope,
} from '@/shared/types/games';

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
  cat: ExplodingCatsCatCard;
  availableModes: ('pair' | 'trio')[];
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
