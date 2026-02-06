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
  | 'evade'
  | 'strike'
  | 'reorder'
  | 'favor'
  | 'nope'
  | 'see_the_future'
  | 'cat_pair'
  | 'cat_trio'
  | 'cat_fiver'
  | 'defuse'
  | 'targeted_strike'
  | 'private_strike'
  | 'recursive_strike'
  | 'mega_evade'
  | 'invert';

export interface SessionPlayerProfile {
  id: string;
  username?: string;
  email?: string | null;
}

export type CriticalCard =
  | 'critical_event'
  | 'neutralizer'
  | 'strike'
  | 'evade'
  | 'trade'
  | 'reorder'
  | 'insight'
  | 'cancel'
  | 'collection_alpha'
  | 'collection_beta'
  | 'collection_gamma'
  | 'collection_delta'
  | 'collection_epsilon'
  | 'targeted_strike'
  | 'private_strike'
  | 'recursive_strike'
  | 'mega_evade'
  | 'invert'
  | 'see_future_5x'
  | 'alter_future_3x'
  | 'alter_future_5x'
  | 'reveal_future_3x'
  | 'share_future_3x'
  | 'draw_bottom'
  | 'swap_top_bottom'
  | 'bury'
  | 'wildcard'
  | 'mark'
  | 'steal_draw'
  | 'stash'
  | 'omniscience'
  | 'miracle'
  | 'smite'
  | 'rapture'
  | 'critical_implosion'
  | 'containment_field'
  | 'fission'
  | 'tribute'
  | 'blackout';

export type CriticalActionCard =
  | 'evade'
  | 'strike'
  | 'reorder'
  | 'private_strike'
  | 'recursive_strike'
  | 'mega_evade'
  | 'invert'
  | 'targeted_strike';

// ===== CAT CARDS Constants =====
export const CAT_CARDS = [
  'collection_alpha',
  'collection_beta',
  'collection_gamma',
  'collection_delta',
  'collection_epsilon',
] as const;

// ===== SPECIAL CARDS Constants =====
export const SPECIAL_CARDS = ['critical_event', 'neutralizer'] as const;

export type CriticalCatCard = (typeof CAT_CARDS)[number];

export type CriticalCatComboInput =
  | {
      cat: CriticalCard;
      mode: 'pair';
      targetPlayerId: string;
      selectedIndex: number;
    }
  | {
      cat: CriticalCard;
      mode: 'trio';
      targetPlayerId: string;
      desiredCard: CriticalCard;
    }
  | {
      mode: 'fiver';
      requestedDiscardCard: CriticalCard;
    };

export interface CriticalPlayerState {
  playerId: string;
  hand: CriticalCard[];
  alive: boolean;
}

export type ChatScope = 'all' | 'players' | 'private';

export interface CriticalLogEntry {
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

export interface CriticalSnapshot {
  deck: CriticalCard[];
  discardPile: CriticalCard[];
  playerOrder: string[];
  currentTurnIndex: number;
  pendingDraws: number;
  pendingDefuse: string | null;
  pendingAction: PendingAction | null;
  pendingFavor: PendingFavor | null;
  players: CriticalPlayerState[];
  logs: CriticalLogEntry[];
  allowActionCardCombos: boolean; // House rule
}

export interface CatComboPromptState {
  cat: CriticalCard | null;
  mode: 'pair' | 'trio' | 'fiver' | null;
  targetPlayerId: string | null;
  desiredCard: CriticalCard | null;
  selectedIndex: number | null;
  requestedDiscardCard: CriticalCard | null;
  available: {
    pair: boolean;
    trio: boolean;
    fiver: boolean;
  };
}

export interface CriticalTableProps {
  room: GameRoomSummary | null;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  actionBusy: ActionBusyType | null;
  startBusy: boolean;
  isHost: boolean;
  onStart: () => void;
  onDraw: () => void;
  onPlay: (card: CriticalActionCard, payload?: Record<string, unknown>) => void;
  onPlayNope: () => void;
  onPlayFavor: (targetPlayerId: string) => void;
  onGiveFavorCard: (cardToGive: CriticalCard) => void;
  onPlaySeeTheFuture: () => void;
  onPlayCatCombo: (payload: CriticalCatComboInput) => void;
  onPlayDefuse: (position: number) => void;
  onPostHistoryNote?: (
    message: string,
    scope: ChatScope,
  ) => Promise<void> | void;
  fullScreen?: boolean;
  tableOnly?: boolean;
  roomName?: string;
  idleTimerEnabled?: boolean;
  cardVariant?: string;
}

export interface ProcessedPlayer {
  playerId: string;
  displayName: string;
  hand: CriticalCard[];
  alive: boolean;
  isCurrentTurn: boolean;
  handSize: number;
  isSelf: boolean;
  orderIndex: number;
}
