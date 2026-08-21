import type { AiDifficulty } from '../../ai-difficulty';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 2;
export const TOTAL_POINTS = 24;
export const CHECKERS_PER_PLAYER = 15;

export const GAME_PHASE = {
  ROLL: 'roll',
  MOVE: 'move',
  GAME_OVER: 'game_over',
} as const;

export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export const ACTION = {
  ROLL_DICE: 'roll_dice',
  MOVE_CHECKER: 'move_checker',
  FORFEIT: 'forfeit',
} as const;

export type ActionType = (typeof ACTION)[keyof typeof ACTION];

export type PlayerColor = 'white' | 'black';

export const VARIANTS = ['standard'] as const;
export type Variant = (typeof VARIANTS)[number];

export interface BackgammonOptions {
  variant: Variant;
  aiDifficulty?: AiDifficulty;
}

export const DEFAULT_OPTIONS: BackgammonOptions = {
  variant: 'standard',
  aiDifficulty: 'medium',
};
