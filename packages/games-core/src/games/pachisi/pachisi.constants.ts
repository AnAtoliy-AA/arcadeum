import type { AiDifficulty } from '../../lib/ai-difficulty';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;

/** Main shared track length (cells 0..51). */
export const TRACK_LENGTH = 52;
/** Cells between a seat's start cell and its home lane (progress 0..50). */
export const MAIN_PATH_STEPS = 51;
/** Home-lane slots per player (progress 51..55). */
export const HOME_LANE_STEPS = 5;
/** Progress value of a finished token. */
export const FINISH_PROGRESS = MAIN_PATH_STEPS + HOME_LANE_STEPS; // 56
/** Progress value marking a yard token. */
export const YARD_PROGRESS = -1;

/**
 * Seat layout. Each seat owns a start offset on the shared track and a
 * color. Two-player matches use seats 0 and 2 (opposite corners).
 */
export const SEAT_START_OFFSETS = [0, 13, 26, 39] as const;
export const SEAT_COLORS = ['red', 'green', 'yellow', 'blue'] as const;
export type SeatColor = (typeof SEAT_COLORS)[number];

/** Star cells are safe for every player (no captures allowed there). */
export const STAR_CELLS: ReadonlySet<number> = new Set([8, 21, 34, 47]);

export const RULE_VARIANTS = ['standard', 'quick'] as const;
export type RuleVariant = (typeof RULE_VARIANTS)[number];

export const TOKENS_BY_RULE_VARIANT: Record<RuleVariant, number> = {
  standard: 4,
  quick: 2,
};

export const GAME_PHASE = {
  ROLL: 'roll',
  MOVE: 'move',
  GAME_OVER: 'game_over',
} as const;

export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export const ACTION = {
  ROLL_DICE: 'roll_dice',
  MOVE_TOKEN: 'move_token',
  PASS_TURN: 'pass_turn',
  FORFEIT: 'forfeit',
} as const;

export type ActionType = (typeof ACTION)[keyof typeof ACTION];

export const VARIANTS = [
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
export type Variant = (typeof VARIANTS)[number];

export interface PachisiOptions {
  /** Visual theme id (shared themes); gameplay lives in ruleVariant. */
  variant: Variant;
  ruleVariant: RuleVariant;
  aiDifficulty?: AiDifficulty;
}

export const DEFAULT_OPTIONS: PachisiOptions = {
  variant: 'adventure',
  ruleVariant: 'standard',
  aiDifficulty: 'medium',
};
