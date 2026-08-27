export type Difficulty = 'easy' | 'medium' | 'hard';

/** Target number of givens per difficulty (classic ranges). */
export const DIFFICULTY_CLUES: Record<Difficulty, number> = {
  easy: 40,
  medium: 32,
  hard: 26,
};

export type GameStatus = 'playing' | 'won';

export interface SudokuState {
  difficulty: Difficulty;
  /** Fully solved grid, row-major, length 81. Immutable once generated. */
  solution: number[];
  /** The puzzle's given clues, row-major, length 81 (0 = empty). */
  givens: number[];
  /** Current player values, row-major, length 81 (0 = empty). */
  cells: number[];
  /** Pencil-mark candidate digits per cell; each array holds unique digits 1–9. */
  notes: number[][];
  status: GameStatus;
  mistakes: number;
}

export const EMPTY_VALUE = 0;

export function emptyNotes(): number[][] {
  return Array.from({ length: 81 }, () => []);
}

/** Row index (0–8) of the cell at `index` (0–80). */
export function rowOf(index: number): number {
  return Math.floor(index / 9);
}

/** Column index (0–8) of the cell at `index` (0–80). */
export function colOf(index: number): number {
  return index % 9;
}

/** Top-left index of the 3×3 box containing `index`. */
export function boxTopLeft(index: number): number {
  const row = Math.floor(rowOf(index) / 3) * 3;
  const col = Math.floor(colOf(index) / 3) * 3;
  return row * 9 + col;
}

export function isGiven(state: SudokuState, index: number): boolean {
  return state.givens[index] !== EMPTY_VALUE;
}

/**
 * Cells conflicting with `index` under classic Sudoku rules — same row,
 * column or 3×3 box currently holding the same non-zero value.
 */
export function findConflicts(cells: number[], index: number): number[] {
  const value = cells[index];
  if (value === EMPTY_VALUE) return [];

  const conflicts: number[] = [];
  const seen = new Set<number>();
  for (let i = 0; i < 81; i += 1) {
    if (i === index || cells[i] !== value) continue;
    if (
      rowOf(i) === rowOf(index) ||
      colOf(i) === colOf(index) ||
      boxTopLeft(i) === boxTopLeft(index)
    ) {
      if (!seen.has(i)) {
        seen.add(i);
        conflicts.push(i);
      }
    }
  }
  return conflicts;
}
