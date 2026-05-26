import type { BaseGameWidgetProps } from '@/features/games/types/base';

export type CascadeGameProps = BaseGameWidgetProps;

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 10;

export const CASCADE_VARIANT_IDS = [
  'cosmic',
  'arcane',
  'cyberpunk',
  'elemental',
] as const;
export type CascadeVariant = (typeof CASCADE_VARIANT_IDS)[number];

export const CARD_COLORS = ['R', 'Y', 'G', 'B', 'W'] as const;
export type CardColor = (typeof CARD_COLORS)[number];

export const ACTIVE_COLORS = ['R', 'Y', 'G', 'B'] as const;
export type ActiveColor = (typeof ACTIVE_COLORS)[number];

export const CARD_KINDS = [
  'NUMBER',
  'SKIP',
  'REVERSE',
  'DRAW_TWO',
  'WILD',
  'WILD_DRAW_FOUR',
] as const;
export type CardKind = (typeof CARD_KINDS)[number];

export const GAME_PHASE = {
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
} as const;
export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export const PENDING = {
  NONE: 'none',
  WILD_COLOR: 'wild_color',
  WILD_DRAW_FOUR_COLOR: 'wild_draw_four_color',
} as const;
export type PendingAction = (typeof PENDING)[keyof typeof PENDING];

export interface CascadeCard {
  id: string;
  color: CardColor;
  kind: CardKind;
  value?: number;
}

export interface CascadeOptions {
  variant: CascadeVariant;
  stackingEnabled: boolean;
}

export interface CascadePlayer {
  playerId: string;
  alive: boolean;
  hand: CascadeCard[];
}

export interface CascadeLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  scope?: 'all' | 'players' | 'private' | 'team';
  senderId?: string | null;
  senderName?: string | null;
  targetId?: string | null;
}

export interface CascadeClientState {
  phase: GamePhase;
  options: CascadeOptions;
  players: CascadePlayer[];
  playerOrder: string[];
  currentTurnIndex: number;
  direction: 1 | -1;
  drawPile: CascadeCard[];
  discardPile: CascadeCard[];
  topCard: CascadeCard;
  activeColor: ActiveColor;
  pendingDraw: number;
  pendingStackKind: 'DRAW_TWO' | 'WILD_DRAW_FOUR' | null;
  pendingAction: PendingAction;
  winnerId: string | null;
  logs: CascadeLogEntry[];
}
