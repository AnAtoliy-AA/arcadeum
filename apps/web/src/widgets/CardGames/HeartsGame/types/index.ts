import type { BaseGameWidgetProps } from '@/features/games/types/base';

export type HeartsGameProps = BaseGameWidgetProps;

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 4;

export const HEARTS_VARIANT_IDS = [
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
export type HeartsVariant = (typeof HEARTS_VARIANT_IDS)[number];

/** Type guard for untrusted variant strings (room gameOptions). */
export function isHeartsVariant(value: unknown): value is HeartsVariant {
  return (
    typeof value === 'string' &&
    (HEARTS_VARIANT_IDS as readonly string[]).includes(value)
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
  PASSING: 'passing',
  PLAYING: 'playing',
  HAND_OVER: 'hand_over',
  GAME_OVER: 'game_over',
} as const;
export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export const PASS_DIRECTIONS = ['left', 'right', 'across', 'hold'] as const;
export type PassDirection = (typeof PASS_DIRECTIONS)[number];

export interface HeartsOptions {
  passingEnabled: boolean;
  targetScore: 50 | 100;
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
export interface HeartsPlayer {
  playerId: string;
}

export interface HeartsLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  scope?: 'all' | 'players' | 'private' | 'team';
  senderId?: string | null;
  senderName?: string | null;
  targetId?: string | null;
}

export interface HeartsClientState {
  phase: GamePhase;
  options: HeartsOptions;
  handNumber: number;
  passDirection: PassDirection;
  players: HeartsPlayer[];
  playerOrder: string[];
  currentTurnIndex: number;
  hands: Record<string, string[]>;
  taken: Record<string, string[]>;
  /** Cards selected for passing but not yet resolved (sanitized for others). */
  pendingPasses: Record<string, string[]>;
  scores: Record<string, number>;
  handScores: Record<string, number>;
  currentTrick: CurrentTrick;
  heartsBroken: boolean;
  winnerIds: string[] | null;
  winType: 'standard' | 'shoot_the_moon' | null;
  isDraw: boolean;
  logs: HeartsLogEntry[];
}
