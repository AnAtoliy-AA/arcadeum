import type { BaseGameWidgetProps } from '@/features/games/types/base';

export type CatDashGameProps = BaseGameWidgetProps;

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

export const TRACK_TYPES = ['linear', 'circular', 'multiple'] as const;
export type TrackType = (typeof TRACK_TYPES)[number];

export type Theme = CatDashTheme;

export const CAT_IDS = [
  'neon',
  'whiskers',
  'stardust',
  'felix',
  'shadow',
  'luna',
] as const;
export type CatId = (typeof CAT_IDS)[number];

export const CAT_DASH_THEME_IDS = [
  'cyberpunk',
  'underwater',
  'crime',
  'horror',
  'adventure',
  'high-altitude-hike',
  'galaxy',
  'fantasy',
  'western',
  'egypt',
  'steampunk',
  'zen',
] as const;
export type CatDashTheme = (typeof CAT_DASH_THEME_IDS)[number];

export interface CatDashPlayer {
  playerId: string;
  catId: CatId;
  position: number;
  powerTokens: number;
  abilitiesUsed: string[];
  isReady: boolean;
  hasBonus: boolean;
}

export interface TrackSpace {
  id: number;
  type: 'normal' | 'obstacle' | 'bonus' | 'fork';
  theme?: string;
  effect?: {
    type: 'skip_turn' | 'extra_roll' | 'power_recharge' | 'teleport';
    value?: number;
  };
}

export interface CatDashOptions {
  trackType: TrackType;
  theme: Theme;
  columns?: number;
  trackLength?: number;
}

export interface CatDashLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  scope?: 'all' | 'players' | 'private' | 'team';
  senderId?: string | null;
  senderName?: string | null;
  targetId?: string | null;
}

export interface CatDashClientState {
  trackType: TrackType;
  theme: Theme;
  columns: number;
  trackLength: number;
  players: CatDashPlayer[];
  currentPlayerIndex: number;
  turnNumber: number;
  track: TrackSpace[];
  winner?: string;
  gameOver: boolean;
  logs: CatDashLogEntry[];
}
