import type { PachisiToken } from '../types';
import {
  FINISH_PROGRESS,
  SEAT_START_OFFSETS,
  STAR_CELLS,
  TRACK_LENGTH,
  YARD_PROGRESS,
} from '../types';

export { SEAT_START_OFFSETS, STAR_CELLS };

/** Main-track index → [row, col] on a 15×15 grid (0-indexed). */
export const TRACK_COORDS: ReadonlyArray<readonly [number, number]> = [
  [6, 1],
  [6, 2],
  [6, 3],
  [6, 4],
  [6, 5],
  [5, 6],
  [4, 6],
  [3, 6],
  [2, 6],
  [1, 6],
  [0, 6],
  [0, 7],
  [0, 8],
  [1, 8],
  [2, 8],
  [3, 8],
  [4, 8],
  [5, 8],
  [6, 9],
  [6, 10],
  [6, 11],
  [6, 12],
  [6, 13],
  [6, 14],
  [7, 14],
  [8, 14],
  [8, 13],
  [8, 12],
  [8, 11],
  [8, 10],
  [8, 9],
  [9, 8],
  [10, 8],
  [11, 8],
  [12, 8],
  [13, 8],
  [14, 8],
  [14, 7],
  [14, 6],
  [13, 6],
  [12, 6],
  [11, 6],
  [10, 6],
  [9, 6],
  [8, 5],
  [8, 4],
  [8, 3],
  [8, 2],
  [8, 1],
  [8, 0],
  [7, 0],
  [6, 0],
];

/** Home-lane cells per seat, progress 51..55 order. */
export const LANE_COORDS: Record<
  number,
  ReadonlyArray<readonly [number, number]>
> = {
  0: [
    [7, 1],
    [7, 2],
    [7, 3],
    [7, 4],
    [7, 5],
  ],
  1: [
    [1, 7],
    [2, 7],
    [3, 7],
    [4, 7],
    [5, 7],
  ],
  2: [
    [7, 13],
    [7, 12],
    [7, 11],
    [7, 10],
    [7, 9],
  ],
  3: [
    [13, 7],
    [12, 7],
    [11, 7],
    [10, 7],
    [9, 7],
  ],
};

/** Yard quadrant placement: gridRow / gridColumn spans on the 15×15 grid. */
export const YARD_AREAS: Record<number, { row: number; col: number }> = {
  0: { row: 1, col: 1 },
  1: { row: 1, col: 10 },
  2: { row: 10, col: 10 },
  3: { row: 10, col: 1 },
};

export function absoluteCell(seat: number, progress: number): number {
  return (SEAT_START_OFFSETS[seat] + progress) % TRACK_LENGTH;
}

/**
 * Client mirror of the engine's legal-move rule for the current die.
 * Returns the set of movable token ids.
 */
export function movableTokenIds(
  tokens: PachisiToken[] | undefined,
  die: number | null,
): Set<number> {
  const movable = new Set<number>();
  if (!tokens || die === null) return movable;
  for (const token of tokens) {
    if (token.progress === YARD_PROGRESS) {
      if (die === 6) movable.add(token.id);
      continue;
    }
    if (
      token.progress < FINISH_PROGRESS &&
      token.progress + die <= FINISH_PROGRESS
    ) {
      movable.add(token.id);
    }
  }
  return movable;
}
