import {
  EMPTY_VALUE,
  boxTopLeft,
  colOf,
  emptyNotes,
  isGiven,
  rowOf,
  DIFFICULTY_CLUES,
  type Difficulty,
  type SudokuState,
} from '../types';

/** Digits 1–9 in natural order. */
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function shuffle<T>(items: T[], rng: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** True if `digit` can legally be placed at `index` on `grid`. */
export function isValidPlacement(
  grid: number[],
  index: number,
  digit: number,
): boolean {
  const row = rowOf(index);
  const col = colOf(index);
  for (let i = 0; i < 9; i += 1) {
    if (grid[row * 9 + i] === digit) return false;
    if (grid[i * 9 + col] === digit) return false;
  }
  const top = boxTopLeft(index);
  for (let dy = 0; dy < 3; dy += 1) {
    for (let dx = 0; dx < 3; dx += 1) {
      if (grid[top + dy * 9 + dx] === digit) return false;
    }
  }
  return true;
}

/** Backtracking solver that counts solutions up to `limit` (early exit). */
export function countSolutions(
  grid: number[],
  limit = 2,
  rng?: () => number,
): number {
  const work = [...grid];
  let found = 0;

  function solve(): boolean {
    // Returns true when the caller must stop (limit reached).
    let best = -1;
    let bestCandidates: number[] = [];
    for (let index = 0; index < 81; index += 1) {
      if (work[index] !== EMPTY_VALUE) continue;
      const candidates = DIGITS.filter((digit) =>
        isValidPlacement(work, index, digit),
      );
      if (candidates.length === 0) return false;
      if (best === -1 || candidates.length < bestCandidates.length) {
        best = index;
        bestCandidates = candidates;
        if (candidates.length === 1) break;
      }
    }
    if (best === -1) {
      found += 1;
      return found >= limit;
    }

    const order = rng ? shuffle(bestCandidates, rng) : bestCandidates;
    for (const digit of order) {
      work[best] = digit;
      if (solve()) {
        work[best] = EMPTY_VALUE;
        return true;
      }
      work[best] = EMPTY_VALUE;
    }
    return false;
  }

  solve();
  return found;
}

/** Generates a complete valid solved grid via randomized backtracking. */
export function generateSolvedGrid(rng: () => number): number[] {
  const grid = Array<number>(81).fill(EMPTY_VALUE);

  function fill(index: number): boolean {
    if (index === 81) return true;
    if (grid[index] !== EMPTY_VALUE) return fill(index + 1);
    for (const digit of shuffle(DIGITS, rng)) {
      if (!isValidPlacement(grid, index, digit)) continue;
      grid[index] = digit;
      if (fill(index + 1)) return true;
      grid[index] = EMPTY_VALUE;
    }
    return false;
  }

  fill(0);
  return grid;
}

/**
 * Digs clues out of a solved grid while keeping the solution unique. Cells
 * are visited in random order and removed only if the puzzle still admits
 * exactly one solution; digging stops once the difficulty target is hit.
 */
export function generatePuzzle(
  difficulty: Difficulty,
  rng: () => number,
): { givens: number[]; solution: number[] } {
  const solution = generateSolvedGrid(rng);
  const givens = [...solution];
  const target = DIFFICULTY_CLUES[difficulty];
  let cluesLeft = 81;

  for (const index of shuffle(
    Array.from({ length: 81 }, (_, i) => i),
    rng,
  )) {
    if (cluesLeft <= target) break;
    const removed = givens[index];
    if (removed === EMPTY_VALUE) continue;
    givens[index] = EMPTY_VALUE;
    if (countSolutions(givens, 2) === 1) {
      cluesLeft -= 1;
    } else {
      givens[index] = removed;
    }
  }

  return { givens, solution };
}

/** Creates a fresh game state with the given clues locked in. */
export function newGame(difficulty: Difficulty, rng?: () => number): SudokuState {
  const random = rng ?? (() => Math.random());
  const { givens, solution } = generatePuzzle(difficulty, random);
  return {
    difficulty,
    solution,
    givens,
    cells: [...givens],
    notes: emptyNotes(),
    status: 'playing',
    mistakes: 0,
  };
}

/**
 * Writes a value into a non-given cell. Correct entries clear that cell's
 * notes; wrong entries count as a mistake and are not placed. Returns the
 * same reference when the move is illegal.
 */
export function setCellValue(
  state: SudokuState,
  index: number,
  value: number,
): SudokuState {
  if (state.status !== 'playing') return state;
  if (value !== EMPTY_VALUE && (value < 1 || value > 9)) return state;
  if (isGiven(state, index)) return state;
  if (state.cells[index] === value) return state;

  if (value === EMPTY_VALUE) {
    const cells = state.cells.map((cell, i) => (i === index ? EMPTY_VALUE : cell));
    return { ...state, cells };
  }

  if (state.solution[index] !== value) {
    return { ...state, mistakes: state.mistakes + 1 };
  }

  const cells = state.cells.map((cell, i) => (i === index ? value : cell));
  const notes = state.notes.map((cellNotes, i) =>
    i === index ? [] : cellNotes.filter((n) => n !== value),
  );
  // Row/column/box peers can no longer hold this digit — prune their notes.
  for (let peer = 0; peer < 81; peer += 1) {
    if (peer === index) continue;
    if (
      rowOf(peer) === rowOf(index) ||
      colOf(peer) === colOf(index) ||
      boxTopLeft(peer) === boxTopLeft(index)
    ) {
      notes[peer] = notes[peer].filter((n) => n !== value);
    }
  }

  const won =
    cells.every((cell, i) => cell === state.solution[i]) ? 'won' : 'playing';
  return { ...state, cells, notes, status: won };
}

/** Toggles a pencil-mark digit on an empty, non-given cell. */
export function toggleNote(
  state: SudokuState,
  index: number,
  digit: number,
): SudokuState {
  if (state.status !== 'playing') return state;
  if (digit < 1 || digit > 9) return state;
  if (isGiven(state, index)) return state;
  if (state.cells[index] !== EMPTY_VALUE) return state;

  const notes = state.notes.map((cellNotes, i) => {
    if (i !== index) return cellNotes;
    return cellNotes.includes(digit)
      ? cellNotes.filter((n) => n !== digit)
      : [...cellNotes, digit].sort((a, b) => a - b);
  });
  return { ...state, notes };
}
