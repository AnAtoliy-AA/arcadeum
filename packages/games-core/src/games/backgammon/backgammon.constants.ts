import type { AiDifficulty } from '../../lib/ai-difficulty';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 2;
export const TOTAL_POINTS = 24;

export const RULE_VARIANTS = [
  'standard',
  'long',
  'hyper',
  'tavla',
  'nackgammon',
  'gulbara',
] as const;
export type RuleVariant = (typeof RULE_VARIANTS)[number];

export const CHECKERS_PER_VARIANT: Record<RuleVariant, number> = {
  standard: 15,
  long: 15,
  hyper: 3,
  tavla: 15,
  nackgammon: 15,
  gulbara: 15,
};

export const GAME_PHASE = {
  ROLL: 'roll',
  MOVE: 'move',
  GAME_OVER: 'game_over',
} as const;

export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export const ACTION = {
  ROLL_DICE: 'roll_dice',
  MOVE_CHECKER: 'move_checker',
  PASS_TURN: 'pass_turn',
  FORFEIT: 'forfeit',
} as const;

export type ActionType = (typeof ACTION)[keyof typeof ACTION];

export type PlayerColor = 'white' | 'black';

export const VARIANTS = ['standard'] as const;
export type Variant = (typeof VARIANTS)[number];

export interface BackgammonOptions {
  variant: Variant;
  ruleVariant: RuleVariant;
  aiDifficulty?: AiDifficulty;
}

export const DEFAULT_OPTIONS: BackgammonOptions = {
  variant: 'standard',
  ruleVariant: 'standard',
  aiDifficulty: 'medium',
};
