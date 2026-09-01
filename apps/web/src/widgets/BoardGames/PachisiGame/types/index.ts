import type { BaseGameWidgetProps } from '@/features/games/types/base';

export type PachisiGameProps = BaseGameWidgetProps;

export const TRACK_LENGTH = 52;
export const MAIN_PATH_STEPS = 51;
export const HOME_LANE_STEPS = 5;
export const FINISH_PROGRESS = MAIN_PATH_STEPS + HOME_LANE_STEPS;
export const YARD_PROGRESS = -1;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;

export const SEAT_START_OFFSETS = [0, 13, 26, 39] as const;

/** Star cells are safe for every player (no captures allowed there). */
export const STAR_CELLS: ReadonlySet<number> = new Set([8, 21, 34, 47]);

export const PACHISI_THEME_IDS = [
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
export type PachisiTheme = (typeof PACHISI_THEME_IDS)[number];

export const SEAT_COLORS = ['red', 'green', 'yellow', 'blue'] as const;
export type SeatColor = (typeof SEAT_COLORS)[number];

export const GAME_PHASE = {
  LOBBY: 'lobby',
  ROLL: 'roll',
  MOVE: 'move',
  GAME_OVER: 'game_over',
} as const;
export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export interface PachisiToken {
  id: number;
  /** -1 = yard, 0..50 main track, 51..55 home lane, 56 finished. */
  progress: number;
}

export interface PachisiPlayer {
  playerId: string;
  seat: number;
  color: SeatColor;
  alive: boolean;
}

export interface MoveTokenPayload {
  tokenId: number;
}

export const PACHISI_MODES = ['standard', 'quick'] as const;
export type PachisiMode = (typeof PACHISI_MODES)[number];

export interface PachisiOptions {
  theme: PachisiTheme;
  variant?: PachisiTheme;
  mode?: PachisiMode;
  aiDifficulty?: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface PachisiLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  scope?: 'all' | 'players' | 'private' | 'team';
  senderId?: string | null;
  senderName?: string | null;
  targetId?: string | null;
}

export interface PachisiClientState {
  phase: GamePhase;
  options: PachisiOptions;
  seats: Record<string, number>;
  tokens: Record<string, PachisiToken[]>;
  die: number | null;
  consecutiveSixes: number;
  currentTurnIndex: number;
  playerOrder: string[];
  players: PachisiPlayer[];
  winnerId: string | null;
  isDraw: boolean;
  logs: PachisiLogEntry[];
}
