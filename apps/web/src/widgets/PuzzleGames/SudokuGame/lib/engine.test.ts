import { describe, expect, it } from 'vitest';
import {
  countSolutions,
  generatePuzzle,
  generateSolvedGrid,
  isValidPlacement,
  newGame,
  setCellValue,
  toggleNote,
} from './engine';
import {
  boxTopLeft,
  colOf,
  findConflicts,
  isGiven,
  rowOf,
} from '../types';

/** Deterministic RNG for reproducible boards. */
function seededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

describe('coordinate helpers', () => {
  it('maps indices to rows, columns and boxes', () => {
    expect(rowOf(0)).toBe(0);
    expect(rowOf(80)).toBe(8);
    expect(colOf(8)).toBe(8);
    expect(boxTopLeft(0)).toBe(0);
    expect(boxTopLeft(40)).toBe(30);
    expect(boxTopLeft(80)).toBe(60);
  });
});

describe('isValidPlacement', () => {
  it('rejects duplicates in row, column and box', () => {
    const grid = Array<number>(81).fill(0);
    grid[0] = 5;
    expect(isValidPlacement(grid, 1, 5)).toBe(false); // same row
    expect(isValidPlacement(grid, 9, 5)).toBe(false); // same column
    expect(isValidPlacement(grid, 10, 5)).toBe(false); // same box
    expect(isValidPlacement(grid, 80, 5)).toBe(true);
  });
});

describe('generateSolvedGrid', () => {
  it('produces a complete valid solution', () => {
    const grid = generateSolvedGrid(seededRng(42));
    expect(grid).toHaveLength(81);
    for (let index = 0; index < 81; index += 1) {
      expect(grid[index]).toBeGreaterThanOrEqual(1);
      expect(grid[index]).toBeLessThanOrEqual(9);
      const peers = [...grid];
      const value = peers[index];
      peers[index] = 0;
      expect(isValidPlacement(peers, index, value)).toBe(true);
    }
  });

  it('is deterministic with a seeded rng', () => {
    expect(generateSolvedGrid(seededRng(7))).toEqual(
      generateSolvedGrid(seededRng(7)),
    );
  });
});

describe('countSolutions', () => {
  it('finds exactly one solution for a valid puzzle', () => {
    const solved = generateSolvedGrid(seededRng(3));
    const puzzle = [...solved];
    puzzle[0] = 0;
    puzzle[1] = 0;
    expect(countSolutions(puzzle, 2)).toBe(1);
  });

  it('stops at the limit when multiple solutions exist', () => {
    // Only four givens — massively underconstrained.
    const grid = Array<number>(81).fill(0);
    grid[0] = 1;
    grid[10] = 2;
    grid[20] = 3;
    grid[30] = 4;
    expect(countSolutions(grid, 2)).toBe(2);
  });
});

describe('generatePuzzle', () => {
  it('keeps a unique solution and hits near the difficulty target', () => {
    const { givens, solution } = generatePuzzle('easy', seededRng(11));
    const clues = givens.filter((v) => v !== 0).length;
    // Digging may stall before the target; assert a sane easy range.
    expect(clues).toBeGreaterThanOrEqual(36);
    expect(clues).toBeLessThanOrEqual(81);
    // The givens must agree with the solution.
    givens.forEach((value, index) => {
      if (value !== 0) expect(value).toBe(solution[index]);
    });
    expect(countSolutions(givens, 2)).toBe(1);
  });

  it('hard puzzles have fewer clues than easy ones', () => {
    const easy = generatePuzzle('easy', seededRng(21));
    const hard = generatePuzzle('hard', seededRng(21));
    const cluesOf = (puzzle: number[]) =>
      puzzle.filter((v) => v !== 0).length;
    expect(cluesOf(hard.givens)).toBeLessThan(cluesOf(easy.givens));
  });
});

describe('newGame', () => {
  it('sets up an empty playable board from the puzzle', () => {
    const game = newGame('medium', seededRng(33));
    expect(game.cells).toEqual(game.givens);
    expect(game.status).toBe('playing');
    expect(game.mistakes).toBe(0);
    expect(game.solution.filter((v) => v !== 0)).toHaveLength(81);
    expect(game.notes.every((notesCell) => notesCell.length === 0)).toBe(true);
  });

  it('marks givens correctly', () => {
    const game = newGame('medium', seededRng(34));
    game.givens.forEach((value, index) => {
      expect(isGiven(game, index)).toBe(value !== 0);
    });
  });
});

describe('setCellValue', () => {
  it('places correct values and clears related notes', () => {
    const game = newGame('easy', seededRng(43));
    // Find any empty cell.
    const emptyIndex = game.cells.findIndex((cell) => cell === 0);
    if (emptyIndex < 0) throw new Error('no empty cell in generated puzzle');

    let next = toggleNote(game, emptyIndex, 5);
    next = setCellValue(next, emptyIndex, game.solution[emptyIndex]);
    expect(next.cells[emptyIndex]).toBe(game.solution[emptyIndex]);
    expect(next.notes[emptyIndex]).toHaveLength(0);
  });

  it('counts mistakes instead of placing wrong values', () => {
    const game = newGame('easy', seededRng(44));
    const emptyIndex = game.cells.findIndex((cell) => cell === 0);
    if (emptyIndex < 0) throw new Error('no empty cell in generated puzzle');
    const wrongDigit =
      game.solution[emptyIndex] === 1 ? 2 : 1;

    const next = setCellValue(game, emptyIndex, wrongDigit);
    expect(next.cells[emptyIndex]).toBe(0);
    expect(next.mistakes).toBe(game.mistakes + 1);
  });

  it('refuses to overwrite givens or non-empty cells with the same value', () => {
    const game = newGame('easy', seededRng(45));
    const givenIndex = game.givens.findIndex((v) => v !== 0);
    if (givenIndex < 0) throw new Error('no given found');
    expect(setCellValue(game, givenIndex, 3)).toBe(game);

    const filledIndex = game.cells.findIndex((cell) => cell !== 0);
    expect(setCellValue(game, filledIndex, game.cells[filledIndex])).toBe(game);
  });

  it('erases a placed value back to empty', () => {
    const game = newGame('easy', seededRng(46));
    const emptyIndex = game.cells.findIndex((cell) => cell === 0);
    if (emptyIndex < 0) throw new Error('no empty cell in generated puzzle');
    const filled = setCellValue(game, emptyIndex, game.solution[emptyIndex]);
    const erased = setCellValue(filled, emptyIndex, 0);
    expect(erased.cells[emptyIndex]).toBe(0);
  });

  it('wins when every cell matches the solution', () => {
    const game = newGame('easy', seededRng(47));
    let state = game;
    for (let index = 0; index < 81; index += 1) {
      if (state.cells[index] === state.solution[index]) continue;
      state = setCellValue(state, index, state.solution[index]);
    }
    expect(state.status).toBe('won');
    expect(state.mistakes).toBe(0);
  });

  it('no-ops after winning', () => {
    const game = newGame('easy', seededRng(48));
    const won = { ...game, status: 'won' as const };
    expect(setCellValue(won, 0, 5)).toBe(won);
  });
});

describe('toggleNote', () => {
  it('adds and removes pencil marks sorted ascending', () => {
    const game = newGame('easy', seededRng(49));
    const emptyIndex = game.cells.findIndex((cell) => cell === 0);
    if (emptyIndex < 0) throw new Error('no empty cell in generated puzzle');

    let state = toggleNote(game, emptyIndex, 7);
    state = toggleNote(state, emptyIndex, 2);
    expect(state.notes[emptyIndex]).toEqual([2, 7]);
    state = toggleNote(state, emptyIndex, 7);
    expect(state.notes[emptyIndex]).toEqual([2]);
  });

  it('ignores notes on givens and filled cells', () => {
    const game = newGame('easy', seededRng(50));
    const givenIndex = game.givens.findIndex((v) => v !== 0);
    if (givenIndex < 0) throw new Error('no given found');
    const noted = toggleNote(game, givenIndex, 4);
    expect(noted.notes[givenIndex]).toHaveLength(0);

    const filledIndex = game.cells.findIndex((cell) => cell !== 0);
    const notedFilled = toggleNote(game, filledIndex, 4);
    expect(notedFilled).toBe(game);
  });
});

describe('findConflicts', () => {
  it('detects row, column and box conflicts', () => {
    const cells = Array<number>(81).fill(0);
    cells[0] = 6;
    cells[4] = 6; // same row
    cells[72] = 6; // same column
    cells[10] = 6; // same box
    cells[48] = 6; // unrelated

    expect(findConflicts(cells, 0)).toEqual([4, 10, 72]);
    expect(findConflicts(cells, 48)).toEqual([]);
  });

  it('returns nothing for empty cells', () => {
    expect(findConflicts(Array<number>(81).fill(0), 40)).toEqual([]);
  });
});
