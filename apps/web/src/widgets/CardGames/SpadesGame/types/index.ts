import type { BaseGameWidgetProps } from '@/features/games/types/base';

export type SpadesGameProps = BaseGameWidgetProps;

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 4;

export const SPADES_THEME_IDS = [
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
export type SpadesTheme = (typeof SPADES_THEME_IDS)[number];

/** Type guard for untrusted variant strings (room gameOptions). */
export function isSpadesTheme(value: unknown): value is SpadesTheme {
  return (
    typeof value === 'string' &&
    (SPADES_THEME_IDS as readonly string[]).includes(value)
  );
}

export const SUITS = ['C', 'D', 'S', 'H'] as const;
export type Suit = (typeof SUITS)[number];

export const RANKS = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'A',
] as const;
export type Rank = (typeof RANKS)[number];

export const GAME_PHASE = {
  BIDDING: 'bidding',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
} as const;
export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export interface SpadesOptions {
  targetScore: number;
  nilEnabled: boolean;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
}

export interface TrickPlay {
  playerId: string;
  card: string;
}

export interface CurrentTrick {
  plays: TrickPlay[];
  leadSuit: Suit | null;
}

/** Server sends players as bare ids (`{ playerId }`). */
export interface SpadesPlayer {
  playerId: string;
}

export type TeamSide = 'even' | 'odd';

export interface HandSummary {
  handNumber: number;
  teamBids: Record<string, number>;
  teamTricks: Record<string, number>;
  pointsDelta: Record<string, number>;
  nilResults: Array<{ playerId: string; success: boolean }>;
}

export interface SpadesLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  scope?: 'all' | 'players' | 'private' | 'team';
  senderId?: string | null;
  senderName?: string | null;
  targetId?: string | null;
}

export interface SpadesClientState {
  phase: GamePhase;
  options: SpadesOptions;
  handNumber: number;
  players: SpadesPlayer[];
  playerOrder: string[];
  currentTurnIndex: number;
  hands: Record<string, string[]>;
  taken: Record<string, string[]>;
  /** `null` = not yet bid; `0` = Nil bid. */
  bids: Record<string, number | null>;
  scores: Record<string, number>;
  bags: Record<string, number>;
  currentTrick: CurrentTrick;
  spadesBroken: boolean;
  lastHandSummary: HandSummary | null;
  winnerIds: string[] | null;
  isDraw: boolean;
  logs: SpadesLogEntry[];
}
