import type { GameRoomSummary, GameSessionSummary } from '../../api/gamesApi';

export type ActionEffectType =
  | 'draw'
  | 'skip'
  | 'attack'
  | 'steal'
  | 'defuse'
  | 'cat_combo';

export type ActionBusyType =
  | 'draw'
  | 'skip'
  | 'attack'
  | 'shuffle'
  | 'favor'
  | 'nope'
  | 'see_the_future'
  | 'cat_pair'
  | 'cat_trio'
  | 'cat_fiver'
  | 'defuse'
  | 'targeted_attack'
  | 'personal_attack'
  | 'attack_of_the_dead'
  | 'super_skip'
  | 'reverse';

export interface SessionPlayerProfile {
  id: string;
  username?: string;
  email?: string | null;
}

export type ExplodingCatsCard =
  | 'exploding_cat'
  | 'defuse'
  | 'attack'
  | 'skip'
  | 'favor'
  | 'shuffle'
  | 'see_the_future'
  | 'nope'
  | 'tacocat'
  | 'hairy_potato_cat'
  | 'rainbow_ralphing_cat'
  | 'cattermelon'
  | 'bearded_cat'
  | 'targeted_attack'
  | 'personal_attack'
  | 'attack_of_the_dead'
  | 'super_skip'
  | 'reverse';

// ===== CAT CARDS Constants =====
export const CAT_CARDS = [
  'tacocat',
  'hairy_potato_cat',
  'rainbow_ralphing_cat',
  'cattermelon',
  'bearded_cat',
] as const;

// ===== SPECIAL CARDS Constants =====
export const SPECIAL_CARDS = ['exploding_cat', 'defuse'] as const;

export type ExplodingCatsCatCard = (typeof CAT_CARDS)[number];

export type ExplodingCatsCatComboInput =
  | {
      cat: ExplodingCatsCard;
      mode: 'pair';
      targetPlayerId: string;
      selectedIndex: number;
    }
  | {
      cat: ExplodingCatsCard;
      mode: 'trio';
      targetPlayerId: string;
      desiredCard: ExplodingCatsCard;
    }
  | {
      mode: 'fiver';
      requestedDiscardCard: ExplodingCatsCard;
    };

export interface ExplodingCatsPlayerState {
  playerId: string;
  hand: ExplodingCatsCard[];
  alive: boolean;
}

export type ChatScope = 'all' | 'players' | 'private';

export interface ExplodingCatsLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  action?: string; // For defuse detection
  message: string;
  createdAt: string;
  senderId?: string | null;
  senderName?: string | null;
  scope?: ChatScope;
}

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

export interface ExplodingCatsSnapshot {
  deck: ExplodingCatsCard[];
  discardPile: ExplodingCatsCard[];
  playerOrder: string[];
  currentTurnIndex: number;
  pendingDraws: number;
  pendingDefuse: string | null;
  pendingAction: PendingAction | null;
  pendingFavor: PendingFavor | null;
  players: ExplodingCatsPlayerState[];
  logs: ExplodingCatsLogEntry[];
  allowActionCardCombos: boolean; // House rule
}

export interface CatComboPromptState {
  cat: ExplodingCatsCard | null;
  mode: 'pair' | 'trio' | 'fiver' | null;
  targetPlayerId: string | null;
  desiredCard: ExplodingCatsCard | null;
  selectedIndex: number | null;
  requestedDiscardCard: ExplodingCatsCard | null;
  available: {
    pair: boolean;
    trio: boolean;
    fiver: boolean;
  };
}

export interface ExplodingCatsTableProps {
  room: GameRoomSummary | null;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  actionBusy: ActionBusyType | null;
  startBusy: boolean;
  isHost: boolean;
  onStart: () => void;
  onDraw: () => void;
  onPlay: (
    card:
      | 'skip'
      | 'attack'
      | 'shuffle'
      | 'personal_attack'
      | 'attack_of_the_dead'
      | 'super_skip'
      | 'reverse'
      | 'targeted_attack',
    payload?: Record<string, unknown>,
  ) => void;
  onPlayNope: () => void;
  onPlayFavor: (targetPlayerId: string) => void;
  onGiveFavorCard: (cardToGive: ExplodingCatsCard) => void;
  onPlaySeeTheFuture: () => void;
  onPlayCatCombo: (payload: ExplodingCatsCatComboInput) => void;
  onPlayDefuse: (position: number) => void;
  onPostHistoryNote?: (
    message: string,
    scope: ChatScope,
  ) => Promise<void> | void;
  fullScreen?: boolean;
  tableOnly?: boolean;
  roomName?: string;
}

export interface ProcessedPlayer {
  playerId: string;
  displayName: string;
  hand: ExplodingCatsCard[];
  alive: boolean;
  isCurrentTurn: boolean;
  handSize: number;
  isSelf: boolean;
  orderIndex: number;
}
