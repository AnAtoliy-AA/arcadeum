import type { BaseGameWidgetProps } from '@/features/games/types/base';

export type StoneColor = 'black' | 'white';
export type Cell = StoneColor | null;

export const BOARD_SIZES = [9, 13, 19] as const;
export type GoBoardSize = (typeof BOARD_SIZES)[number];

export interface Point {
  row: number;
  col: number;
}

export interface GoPlayer {
  playerId: string;
  color: StoneColor;
  alive: boolean;
}

export interface GoOptions {
  variant: string;
  theme?: string;
  boardSize: number;
  aiDifficulty?: string;
}

export interface BoardScores {
  black: number;
  white: number;
}

export interface GoLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  scope?: 'all' | 'players' | 'private' | 'team';
  senderId?: string | null;
  senderName?: string | null;
  targetId?: string | null;
}

/** Mirrors the BE engine state (go.types.ts) as serialized in the session. */
export interface GoClientState {
  phase: 'playing' | 'game_over';
  options: GoOptions;
  boardSize: number;
  board: Cell[][];
  players: GoPlayer[];
  captures: { black: number; white: number };
  consecutivePasses: number;
  koPoint: Point | null;
  lastMove: Point | null;
  playerOrder: string[];
  currentTurnIndex: number;
  winnerId: string | null;
  isDraw: boolean;
  scores: BoardScores | null;
  logs: GoLogEntry[];
}

export type GoGameProps = BaseGameWidgetProps;

/** Star points (hoshi) per board size — must match BE go.constants.ts. */
export const STAR_POINTS: Record<number, ReadonlyArray<readonly [number, number]>> = {
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
