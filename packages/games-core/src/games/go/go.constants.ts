import type { AiDifficulty } from '../../lib/ai-difficulty';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 2;

export const BOARD_SIZES = [9, 13, 19] as const;
export type BoardSize = (typeof BOARD_SIZES)[number];
export const DEFAULT_BOARD_SIZE: BoardSize = 9;

/** Komi paid to white under Chinese area scoring. */
export const KOMI = 7.5;

export const GAME_PHASE = {
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
} as const;

export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export const ACTION = {
  PLACE_STONE: 'place_stone',
  PASS_TURN: 'pass_turn',
  FORFEIT: 'forfeit',
} as const;

export type ActionType = (typeof ACTION)[keyof typeof ACTION];

export type StoneColor = 'black' | 'white';
export type Cell = StoneColor | null;

/** Star points (hoshi) indexed by board size, [row, col], 0-based. */
export const STAR_POINTS: Record<
  number,
  ReadonlyArray<readonly [number, number]>
> = {
  9: [
    [2, 2],
    [2, 6],
    [4, 4],
    [6, 2],
    [6, 6],
  ],
  13: [
    [3, 3],
    [3, 9],
    [6, 6],
    [9, 3],
    [9, 9],
  ],
  19: [
    [3, 3],
    [3, 9],
    [3, 15],
    [9, 3],
    [9, 9],
    [9, 15],
    [15, 3],
    [15, 9],
    [15, 15],
  ],
};

export interface GoOptions {
  theme: string;
  boardSize: BoardSize;
  aiDifficulty?: AiDifficulty;
}

export const DEFAULT_OPTIONS: GoOptions = {
  theme: 'adventure',
  boardSize: DEFAULT_BOARD_SIZE,
  aiDifficulty: 'medium',
};
