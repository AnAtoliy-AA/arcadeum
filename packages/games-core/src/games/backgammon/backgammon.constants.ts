import type { AiDifficulty } from '../../lib/ai-difficulty';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 2;
export const TOTAL_POINTS = 24;

export const MODES = [
  'standard',
  'long',
  'hyper',
  'tavla',
  'nackgammon',
  'gulbara',
] as const;
export type Mode = (typeof MODES)[number];

export const CHECKERS_PER_MODE: Record<Mode, number> = {
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

export interface BackgammonOptions {
  theme: string;
  mode: Mode;
  aiDifficulty?: AiDifficulty;
}

export const DEFAULT_OPTIONS: BackgammonOptions = {
  theme: 'adventure',
  mode: 'standard',
  aiDifficulty: 'medium',
};
