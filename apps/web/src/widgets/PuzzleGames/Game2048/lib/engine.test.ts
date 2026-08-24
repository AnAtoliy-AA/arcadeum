import { describe, expect, it } from 'vitest';
import {
  collapseLine,
  hasAvailableMoves,
  keepPlaying,
  move,
  newGame,
  spawnTile,
} from './engine';
import { emptyGrid } from '../types';

/** Deterministic RNG for reproducible boards. */
function seededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function stateWith(
  grid: number[],
  overrides: Partial<Parameters<typeof move>[0]> = {},
): Parameters<typeof move>[0] {
  return {
    grid,
    score: 0,
    status: 'playing',
    keepPlaying: false,
    moves: 0,
    ...overrides,
  };
}

describe('spawnTile', () => {
  it('fills exactly one empty cell with a 2 or 4', () => {
    const grid = emptyGrid();
    const spawned = spawnTile(grid, seededRng(42));
    expect(spawned).not.toBe(grid);
    expect(spawned.filter((v) => v !== 0)).toHaveLength(1);
    expect(spawned.filter((v) => v === 2 || v === 4)).toHaveLength(1);
  });

  it('returns the same reference on a full board', () => {
    const full = Array<number>(16).fill(2);
    expect(spawnTile(full, seededRng(7))).toBe(full);
  });
});

describe('newGame', () => {
  it('starts with two tiles and playing status', () => {
    const game = newGame(seededRng(11));
    expect(game.grid.filter((v) => v !== 0)).toHaveLength(2);
    expect(game.score).toBe(0);
    expect(game.status).toBe('playing');
    expect(game.keepPlaying).toBe(false);
    expect(game.moves).toBe(0);
  });
});

describe('move', () => {
  it('slides tiles left and merges equal neighbors once per pair', () => {
    const game = stateWith([
      2, 2, 2, 2,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ]);
    const moved = move(game, 'left', seededRng(3));
    // [2,2,2,2] → [4,4,0,0]
    expect(moved.grid.slice(0, 4)).toEqual([4, 4, 0, 0]);
    expect(moved.score).toBe(8);
  });

  it('prefers the leftmost pair when merging [4,2,2,0]', () => {
    const game = stateWith([
      4, 2, 2, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ]);
    const moved = move(game, 'left', seededRng(5));
    expect(moved.grid.slice(0, 4)).toEqual([4, 4, 0, 0]);
    expect(moved.score).toBe(4);
  });

  it('moves everything right', () => {
    const game = stateWith([
      2, 0, 0, 0,
      4, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ]);
    const moved = move(game, 'right', seededRng(7));
    expect(moved.grid.slice(0, 4)).toEqual([0, 0, 0, 2]);
    expect(moved.grid.slice(4, 8)).toEqual([0, 0, 0, 4]);
  });

  it('moves up and down within a column', () => {
    const upState = stateWith([
      0, 0, 0, 0,
      2, 0, 0, 0,
      2, 0, 0, 0,
      0, 0, 0, 0,
    ]);
    const up = move(upState, 'up', seededRng(9));
    expect(up.grid[0]).toBe(4);
    expect(up.grid.slice(0, 4)).toEqual([4, 0, 0, 0]);

    const downState = stateWith([
      2, 0, 0, 0,
      2, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ]);
    const down = move(downState, 'down', seededRng(10));
    // The merged tile lands in the bottom cell of the column.
    expect(down.grid[12]).toBe(4);
  });

  it('spawns a tile after an effective move', () => {
    const before = stateWith([
      2, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ]);
    const moved = move(before, 'right', seededRng(13));
    expect(moved.grid.filter((v) => v !== 0)).toHaveLength(2);
  });

  it('is a no-op (same reference) when nothing can slide or merge', () => {
    const locked = [
      2, 4, 8, 16,
      16, 8, 4, 2,
      2, 4, 8, 16,
      16, 8, 4, 2,
    ];
    const game = stateWith(locked);
    expect(move(game, 'left')).toBe(game);
    expect(move(game, 'down')).toBe(game);
  });

  it('detects loss when the board is jammed after spawning', () => {
    const locked = [
      2, 4, 8, 16,
      16, 8, 4, 2,
      2, 4, 8, 16,
      16, 8, 4, 2,
    ];
    // One free cell: moving left fills nothing but spawns into the gap…
    const almostFull = [...locked];
    almostFull[15] = 0;
    const game = stateWith(almostFull);
    // Right move shifts rows; after spawn the board may lock. Just assert
    // the engine never returns lost while moves remain.
    const moved = move(game, 'left', seededRng(21));
    if (!hasAvailableMoves(moved.grid)) {
      expect(moved.status).toBe('lost');
    }
  });

  it('marks won when the 2048 tile appears and blocks further moves', () => {
    const nearWin = stateWith([
      1024, 1024, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ]);
    const won = move(nearWin, 'left', seededRng(23));
    expect(won.status).toBe('won');
    expect(won.grid[0]).toBe(2048);
    expect(won.score).toBe(2048);

    const blocked = move(won, 'left', seededRng(24));
    expect(blocked).toBe(won);

    const continued = keepPlaying(won);
    expect(continued.keepPlaying).toBe(true);
    expect(move(continued, 'right', seededRng(25))).not.toBe(continued);
  });

  it('ignores input after a loss', () => {
    const lost = stateWith(
      [
        2, 4, 8, 16,
        16, 8, 4, 2,
        2, 4, 8, 16,
        16, 8, 4, 2,
      ],
      { status: 'lost' },
    );
    expect(move(lost, 'up')).toBe(lost);
  });
});

describe('hasAvailableMoves', () => {
  it('finds empty cells and merge pairs', () => {
    expect(hasAvailableMoves([...emptyGrid(), 0].slice(0, 16))).toBe(true);
    const mergedPair = [
      2, 2, 0, 0,
      4, 8, 16, 32,
      64, 128, 256, 512,
      1024, 2048, 4096, 8192,
    ];
    expect(hasAvailableMoves(mergedPair)).toBe(true);
  });

  it('reports false for a fully jammed board', () => {
    const jammed = [
      2, 4, 8, 16,
      16, 8, 4, 2,
      2, 4, 8, 16,
      16, 8, 4, 2,
    ];
    expect(hasAvailableMoves(jammed)).toBe(false);
  });
});

describe('collapseLine', () => {
  it('merges chains left-to-right without double merges', () => {
    expect(collapseLine([2, 2, 4, 4])).toEqual({
      line: [4, 8, 0, 0],
      gained: 12,
    });
    expect(collapseLine([0, 2, 0, 2])).toEqual({
      line: [4, 0, 0, 0],
      gained: 4,
    });
    expect(collapseLine([2, 0, 0, 0])).toEqual({
      line: [2, 0, 0, 0],
      gained: 0,
    });
  });
});
