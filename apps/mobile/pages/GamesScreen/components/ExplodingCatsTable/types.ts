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
  | 'see_the_future'
  | 'cat_pair'
  | 'cat_trio';

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
  | 'tacocat'
  | 'hairy_potato_cat'
  | 'rainbow_ralphing_cat'
  | 'cattermelon'
  | 'bearded_cat';

export type ExplodingCatsCatCard =
  | 'tacocat'
  | 'hairy_potato_cat'
  | 'rainbow_ralphing_cat'
  | 'cattermelon'
  | 'bearded_cat';

export type ExplodingCatsCatComboInput =
  | {
      cat: ExplodingCatsCatCard;
      mode: 'pair';
      targetPlayerId: string;
    }
  | {
      cat: ExplodingCatsCatCard;
      mode: 'trio';
      targetPlayerId: string;
      desiredCard: ExplodingCatsCard;
    };

export interface ExplodingCatsPlayerState {
  playerId: string;
  hand: ExplodingCatsCard[];
  alive: boolean;
}

export type LogVisibility = 'all' | 'players';

export interface ExplodingCatsLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  senderId?: string | null;
  senderName?: string | null;
  scope?: LogVisibility;
}

export interface ExplodingCatsSnapshot {
  deck: ExplodingCatsCard[];
  discardPile: ExplodingCatsCard[];
  playerOrder: string[];
  currentTurnIndex: number;
  pendingDraws: number;
  players: ExplodingCatsPlayerState[];
  logs: ExplodingCatsLogEntry[];
}

export interface CatComboPromptState {
  cat: ExplodingCatsCatCard;
  mode: 'pair' | 'trio' | null;
  targetPlayerId: string | null;
  desiredCard: ExplodingCatsCard | null;
  available: {
    pair: boolean;
    trio: boolean;
  };
}

export interface ExplodingCatsTableProps {
  room: GameRoomSummary | null;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  actionBusy: 'draw' | 'skip' | 'attack' | 'shuffle' | 'favor' | 'see_the_future' | 'cat_pair' | 'cat_trio' | null;
  startBusy: boolean;
  isHost: boolean;
  onStart: () => void;
  onDraw: () => void;
  onPlay: (card: 'skip' | 'attack' | 'shuffle') => void;
  onPlayFavor: (targetPlayerId: string, desiredCard: string) => void;
  onPlaySeeTheFuture: () => void;
  onPlayCatCombo: (payload: ExplodingCatsCatComboInput) => void;
  onPostHistoryNote?: (
    message: string,
    scope: LogVisibility,
  ) => Promise<void> | void;
  fullScreen?: boolean;
  tableOnly?: boolean;
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
