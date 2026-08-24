import type { AiDifficulty } from '../../lib/ai-difficulty';

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 4;

export const HAND_SIZE = 13;
export const CARDS_PER_PASS = 3;

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

/** Canonical card id format: `<rank><suit>`, e.g. `2C`, `10H`, `QS`, `AS`. */
export const TWO_CLUBS = '2C';
export const QUEEN_OF_SPADES = 'QS';
export const HEART_SUIT: Suit = 'H';

export const PASS_DIRECTIONS = ['left', 'right', 'across', 'hold'] as const;
export type PassDirection = (typeof PASS_DIRECTIONS)[number];

/** Rotation per hand number (0-based): left → right → across → hold → repeat. */
export const PASS_ROTATION: readonly PassDirection[] = [
  'left',
  'right',
  'across',
  'hold',
];

export const GAME_PHASE = {
  PASSING: 'passing',
  PLAYING: 'playing',
  HAND_OVER: 'hand_over',
  GAME_OVER: 'game_over',
} as const;
export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export const ACTION = {
  PASS_CARDS: 'pass_cards',
  PLAY_CARD: 'play_card',
  FORFEIT: 'forfeit',
} as const;
export type ActionType = (typeof ACTION)[keyof typeof ACTION];

export const TARGET_SCORES = [50, 100] as const;
export type TargetScore = (typeof TARGET_SCORES)[number];

export const POINTS_HEART = 1;
export const POINTS_QUEEN_OF_SPADES = 13;
export const MOON_SHOOT_POINTS = 26;

export interface HeartsOptions {
  passingEnabled: boolean;
  /**
   * Hand-end threshold checked by the engine. User input is normalized to
   * `TargetScore` (50|100) by `resolveOptions`/`validateHeartsOptions`; the
   * wider type lets tests run hands without hitting an early game over.
   */
  targetScore: number;
  aiDifficulty?: AiDifficulty;
}

export const DEFAULT_OPTIONS: HeartsOptions = {
  passingEnabled: true,
  targetScore: 100,
  aiDifficulty: 'medium',
};
