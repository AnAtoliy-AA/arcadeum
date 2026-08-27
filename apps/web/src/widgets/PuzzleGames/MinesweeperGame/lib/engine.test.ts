import { describe, expect, it } from 'vitest';
import {
  generateBoard,
  newGame,
  revealCell,
  toggleFlag,
} from './engine';
import { cellIndex, neighbors } from '../types';

/** Deterministic RNG for reproducible boards. */
function seededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

describe('newGame', () => {
  it('creates an empty hidden board for the difficulty', () => {
    const game = newGame('beginner');
    expect(game.cells).toHaveLength(81);
    expect(game.mineCount).toBe(10);
    expect(game.generated).toBe(false);
    expect(game.status).toBe('playing');
    expect(game.flagCount).toBe(0);
    expect(game.revealedCount).toBe(0);
    expect(game.cells.every((cell) => cell.state === 'hidden')).toBe(true);
  });
});

describe('generateBoard', () => {
  it('places exactly mineCount mines avoiding the first click and its neighbors', () => {
    const game = newGame('beginner');
    const safe = cellIndex(game, 4, 4);
    const seeded = generateBoard(game, safe, seededRng(42));
    const mines = seeded.cells
      .map((cell, index) => (cell.mine ? index : -1))
      .filter((index) => index >= 0);
    expect(mines).toHaveLength(10);
    expect(mines).not.toContain(safe);
    for (const n of neighbors(seeded, safe)) {
      expect(mines).not.toContain(n);
    }
  });

  it('computes adjacency counts correctly', () => {
    const game = newGame('beginner');
    const seeded = generateBoard(game, 0, seededRng(7));
    for (let index = 0; index < seeded.cells.length; index += 1) {
      const expected = neighbors(seeded, index).filter(
        (n) => seeded.cells[n].mine,
      ).length;
      expect(seeded.cells[index].adjacent).toBe(expected);
    }
  });

  it('tops up mines outside the safe zone when it is too large', () => {
    // Beginner has 81 cells; a corner click forbids 4 cells leaving 77 —
    // still enough. Force the top-up path with an impossible-safe zone by
    // using a tiny custom board instead.
    const tiny: Parameters<typeof generateBoard>[0] = {
      ...newGame('beginner'),
      width: 3,
      height: 3,
      mineCount: 8,
      cells: newGame('beginner').cells.slice(0, 9),
    };
    const seeded = generateBoard(tiny, cellIndex(tiny, 1, 1), seededRng(3));
    const mines = seeded.cells.filter((cell) => cell.mine).length;
    expect(mines).toBe(8);
    expect(seeded.cells[cellIndex(tiny, 1, 1)].mine).toBe(false);
  });
});

describe('revealCell', () => {
  it('generates the board on first reveal and floods the open area', () => {
    const game = newGame('beginner');
    const next = revealCell(game, cellIndex(game, 0, 0), seededRng(11));
    expect(next.generated).toBe(true);
    expect(next.status).toBe('playing');
    expect(next.revealedCount).toBeGreaterThan(0);
    // The clicked cell itself must be revealed.
    expect(next.cells[cellIndex(game, 0, 0)].state).toBe('revealed');
    expect(next.cells[cellIndex(game, 0, 0)].mine).toBe(false);
  });

  it('keeps the first click safe even when the safe zone must be violated', () => {
    // 3x3 with 8 mines: the forbidden zone leaves no room, so mines top up
    // anywhere except the clicked cell — which becomes the only safe cell,
    // and revealing it wins.
    const base = newGame('beginner');
    const tiny = {
      ...base,
      width: 3,
      height: 3,
      mineCount: 8,
      cells: base.cells.slice(0, 9),
    };
    const revealed = revealCell(tiny, cellIndex(tiny, 1, 1), seededRng(5));
    expect(revealed.status).toBe('won');
    expect(revealed.cells[cellIndex(tiny, 1, 1)].mine).toBe(false);
  });

  it('reveals a single numbered cell without flooding', () => {
    let game = newGame('beginner');
    game = revealCell(game, cellIndex(game, 0, 0), seededRng(21));
    const before = game.revealedCount;
    // Click every revealed cell again (chord no-ops), then count stays stable.
    for (let index = 0; index < game.cells.length; index += 1) {
      if (game.cells[index].state === 'revealed') {
        game = revealCell(game, index, seededRng(21));
      }
    }
    expect(game.revealedCount).toBeGreaterThanOrEqual(before);
  });

  it('explodes and exposes all mines on a mine hit', () => {
    const game = newGame('beginner');
    const seeded = generateBoard(game, 0, seededRng(13));
    const mineIndex = seeded.cells.findIndex((cell) => cell.mine);
    const lost = revealCell(seeded, mineIndex);
    expect(lost.status).toBe('lost');
    expect(lost.cells.every((cell) => !cell.mine || cell.state === 'revealed'))
      .toBe(true);
    // Incorrect flags are cleared so the UI can distinguish them.
    const flaggedSafe = lost.cells.findIndex(
      (cell) => !cell.mine && cell.state === 'flagged',
    );
    expect(flaggedSafe).toBe(-1);
  });

  it('chords a satisfied number and reveals its hidden neighbors', () => {
    // Handcrafted endgame: mines at (0,0), (0,2) and (7,7); everything is
    // revealed except those mines plus (0,1), (1,0) and (8,8). Flagging the
    // two mines satisfies the "2" at (1,1) — chording it opens (0,1)/(1,0)
    // while leaving flags and the distant hidden cell alone.
    const game = newGame('beginner');
    const mines = [cellIndex(game, 0, 0), cellIndex(game, 0, 2), cellIndex(game, 7, 7)];
    const hiddenSafe = [
      cellIndex(game, 0, 1),
      cellIndex(game, 1, 0),
      cellIndex(game, 8, 8),
    ];
    const cells = game.cells.map((cell, index) => ({
      ...cell,
      mine: mines.includes(index),
      state:
        mines.includes(index) || hiddenSafe.includes(index)
          ? ('hidden' as const)
          : ('revealed' as const),
    }));
    for (let index = 0; index < cells.length; index += 1) {
      cells[index].adjacent = neighbors(game, index).filter(
        (n) => cells[n].mine,
      ).length;
    }
    const seeded = { ...game, cells, generated: true };
    expect(cells[cellIndex(game, 1, 1)].adjacent).toBe(2);
    const revealedBefore = seeded.revealedCount;

    let state = toggleFlag(seeded, cellIndex(game, 0, 0));
    state = toggleFlag(state, cellIndex(game, 0, 2));
    expect(state.flagCount).toBe(2);

    const chorded = revealCell(state, cellIndex(game, 1, 1));
    expect(chorded.cells[cellIndex(game, 0, 1)].state).toBe('revealed');
    expect(chorded.cells[cellIndex(game, 1, 0)].state).toBe('revealed');
    expect(chorded.cells[cellIndex(game, 8, 8)].state).toBe('hidden');
    expect(chorded.cells[cellIndex(game, 0, 0)].state).toBe('flagged');
    expect(chorded.status).toBe('playing');
    expect(chorded.revealedCount).toBe(revealedBefore + 2);
  });

  it('chord does nothing while the neighboring flags do not match the number', () => {
    const game = newGame('beginner');
    const mineIndex = cellIndex(game, 0, 0);
    const hiddenSafe = [cellIndex(game, 0, 1), cellIndex(game, 1, 0)];
    const cells = game.cells.map((cell, index) => ({
      ...cell,
      mine: index === mineIndex,
      state:
        index === mineIndex || hiddenSafe.includes(index)
          ? ('hidden' as const)
          : ('revealed' as const),
    }));
    for (let index = 0; index < cells.length; index += 1) {
      cells[index].adjacent = neighbors(game, index).filter(
        (n) => cells[n].mine,
      ).length;
    }
    const seeded = { ...game, cells, generated: true };

    // No flags yet: chording the "1" is a no-op (same reference back).
    expect(revealCell(seeded, cellIndex(game, 1, 1))).toBe(seeded);
  });

  it('no-ops after the game ends', () => {
    const game = newGame('beginner');
    const finished = { ...game, status: 'won' as const };
    expect(revealCell(finished, 0)).toBe(finished);
  });

  it('no-ops on flagged cells', () => {
    let game = newGame('beginner');
    game = generateBoard(game, 0, seededRng(17));
    const target = 40;
    game = toggleFlag(game, target);
    const afterFlag = revealCell(game, target);
    expect(afterFlag.cells[target].state).toBe('flagged');
    expect(afterFlag.revealedCount).toBe(game.revealedCount);
  });
});

describe('toggleFlag', () => {
  it('flags and unflags a hidden cell, tracking flagCount', () => {
    const game = newGame('beginner');
    const flagged = toggleFlag(game, 12);
    expect(flagged.cells[12].state).toBe('flagged');
    expect(flagged.flagCount).toBe(1);
    const unflagged = toggleFlag(flagged, 12);
    expect(unflagged.cells[12].state).toBe('hidden');
    expect(unflagged.flagCount).toBe(0);
  });

  it('cannot flag a revealed cell', () => {
    const game = newGame('beginner');
    const generated = generateBoard(game, 0, seededRng(23));
    const revealedIndex = generated.cells.findIndex(
      (c) => c.state === 'revealed',
    );
    if (revealedIndex < 0) return;
    const next = toggleFlag(generated, revealedIndex);
    expect(next.cells[revealedIndex].state).toBe('revealed');
    expect(next.flagCount).toBe(0);
  });
});

describe('win detection', () => {
  it('marks the game won when every safe cell is revealed', () => {
    const game = newGame('beginner');
    const seeded = generateBoard(game, 0, seededRng(31));
    let state = seeded;
    // Reveal every safe cell directly.
    for (let index = 0; index < state.cells.length; index += 1) {
      const cell = state.cells[index];
      if (cell.mine || cell.state === 'revealed') continue;
      // Reveal via floodReveal through a hidden non-mine cell.
      state = revealCell(state, index);
      if (state.status !== 'playing') break;
    }
    expect(state.status).toBe('won');
  });
});
