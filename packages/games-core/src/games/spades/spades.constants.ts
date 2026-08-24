import type { AiDifficulty } from '../../lib/ai-difficulty';

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 4;

export const HAND_SIZE = 13;
export const TOTAL_TRICKS = 13;

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

/** Canonical card id format: `<rank><suit>`, e.g. `2C`, `10H`, `QS`. */
export const SPADE_SUIT: Suit = 'S';

export const GAME_PHASE = {
  BIDDING: 'bidding',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
} as const;
export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export const ACTION = {
  BID: 'bid',
  PLAY_CARD: 'play_card',
  FORFEIT: 'forfeit',
} as const;
export type ActionType = (typeof ACTION)[keyof typeof ACTION];

export const TARGET_SCORES = [300, 500] as const;
export type TargetScore = (typeof TARGET_SCORES)[number];

export const MIN_BID = 1;
export const MAX_BID = TOTAL_TRICKS;
/** A bid of 0 means Nil (take zero tricks). */
export const NIL_BID = 0;

export const POINTS_PER_TRICK_OF_BID = 10;
export const NIL_SUCCESS_POINTS = 100;
export const NIL_FAILURE_PENALTY = 100;
export const BAG_PENALTY_THRESHOLD = 10;
export const BAG_PENALTY_POINTS = 100;

/**
 * Team side derived from seating parity: `playerOrder[0]`/`[2]` are partners
 * ("even"), `playerOrder[1]`/`[3]` are partners ("odd").
 */
export type TeamSide = 'even' | 'odd';

export interface SpadesOptions {
  targetScore: number;
  nilEnabled: boolean;
  aiDifficulty?: AiDifficulty;
}

export const DEFAULT_OPTIONS: SpadesOptions = {
  targetScore: 500,
  nilEnabled: true,
  aiDifficulty: 'medium',
};
