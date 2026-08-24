import {
  DIFFICULTIES,
  neighbors,
  type Cell,
  type Difficulty,
  type MinesweeperState,
} from '../types';

export function emptyCells(count: number): Cell[] {
  return Array.from({ length: count }, () => ({
    mine: false,
    adjacent: 0,
    state: 'hidden' as const,
  }));
}

export function newGame(difficulty: Difficulty): MinesweeperState {
  const config = DIFFICULTIES[difficulty];
  return {
    difficulty,
    width: config.width,
    height: config.height,
    mineCount: config.mines,
    cells: emptyCells(config.width * config.height),
    generated: false,
    status: 'playing',
    revealedCount: 0,
    flagCount: 0,
  };
}

/** Fisher–Yates with an injectable RNG for deterministic tests. */
function shuffle<T>(items: T[], rng?: () => number): T[] {
  const result = [...items];
  const random = rng ?? (() => Math.random());
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Places mines avoiding the first-clicked cell and its neighborhood, then
 * computes adjacency counts. If the safe zone leaves too few candidate
 * slots (tiny boards), mines top up anywhere except the clicked cell.
 */
export function generateBoard(
  state: MinesweeperState,
  safeIndex: number,
  rng?: () => number,
): MinesweeperState {
  const forbidden = new Set([safeIndex, ...neighbors(state, safeIndex)]);
  let candidates = shuffle(
    state.cells.map((_, index) => index).filter((index) => !forbidden.has(index)),
    rng,
  ).slice(0, state.mineCount);
  if (candidates.length < state.mineCount) {
    const extra = shuffle(
      state.cells
        .map((_, index) => index)
        .filter((index) => index !== safeIndex && !candidates.includes(index)),
      rng,
    );
    candidates = [...candidates, ...extra.slice(0, state.mineCount - candidates.length)];
  }
  const mines = new Set(candidates);

  const cells = state.cells.map((cell, index) => ({
    ...cell,
    mine: mines.has(index),
  }));
  for (let index = 0; index < cells.length; index += 1) {
    cells[index].adjacent = neighbors(state, index).filter((n) => cells[n].mine)
      .length;
  }

  return { ...state, cells, generated: true };
}

function finalize(state: MinesweeperState): MinesweeperState {
  const totalSafe = state.width * state.height - state.mineCount;
  if (state.revealedCount < totalSafe) return state;
  return { ...state, status: 'won' };
}

/**
 * Reveals `startIndex` with flood fill. Returns null if a mine was hit
 * (caller converts to a loss); otherwise returns the advanced state.
 */
function floodReveal(
  state: MinesweeperState,
  startIndex: number,
): MinesweeperState | null {
  const cells = state.cells.map((cell) => ({ ...cell }));
  let revealed = 0;

  const stack = [startIndex];
  while (stack.length > 0) {
    const index = stack.pop();
    if (index === undefined) break;
    const cell = cells[index];
    if (cell.state !== 'hidden') continue;
    if (cell.mine) return null;

    cell.state = 'revealed';
    revealed += 1;

    if (cell.adjacent === 0) {
      for (const n of neighbors(state, index)) {
        if (cells[n].state === 'hidden') stack.push(n);
      }
    }
  }
  return finalize({
    ...state,
    cells,
    revealedCount: state.revealedCount + revealed,
  });
}

/** Chord: clicking a satisfied number opens its remaining hidden neighbors. */
function chordReveal(state: MinesweeperState, index: number): MinesweeperState | null {
  const cell = state.cells[index];
  if (!cell || cell.state !== 'revealed' || cell.adjacent === 0) return state;

  const flaggedAround = neighbors(state, index).filter(
    (n) => state.cells[n].state === 'flagged',
  ).length;
  if (flaggedAround !== cell.adjacent) return state;

  let current = state;
  for (const n of neighbors(state, index)) {
    if (current.cells[n].state !== 'hidden') continue;
    const next = floodReveal(current, n);
    if (next === null) return null;
    current = next;
    if (current.status !== 'playing') return current;
  }
  return current;
}

/** Loss: expose every mine, drop incorrect flags. */
function explode(state: MinesweeperState): MinesweeperState {
  return {
    ...state,
    status: 'lost',
    cells: state.cells.map((cell) =>
      cell.mine
        ? { ...cell, state: 'revealed' as const }
        : cell.state === 'flagged'
          ? { ...cell, state: 'hidden' as const }
          : cell,
    ),
  };
}

/**
 * Reveals a hidden (or chords a revealed) cell. First reveal generates the
 * board around the click. No-ops return the same reference.
 */
export function revealCell(
  state: MinesweeperState,
  index: number,
  rng?: () => number,
): MinesweeperState {
  if (state.status !== 'playing') return state;
  const cell = state.cells[index];
  if (!cell || cell.state === 'flagged') return state;

  if (!state.generated) {
    const seeded = generateBoard(state, index, rng);
    const flooded = floodReveal(seeded, index);
    return flooded === null ? explode(seeded) : flooded;
  }

  const result =
    cell.state === 'revealed'
      ? chordReveal(state, index)
      : floodReveal(state, index);

  if (result === null) return explode(state);
  return result;
}

/** Toggles a flag on a hidden cell. */
export function toggleFlag(state: MinesweeperState, index: number): MinesweeperState {
  if (state.status !== 'playing') return state;
  const cell = state.cells[index];
  if (!cell || cell.state === 'revealed') return state;

  const cells = state.cells.map((c, i) =>
    i === index
      ? {
          ...c,
          state: c.state === 'flagged' ? ('hidden' as const) : ('flagged' as const),
        }
      : c,
  );
  const delta = cell.state === 'flagged' ? -1 : 1;
  return { ...state, cells, flagCount: state.flagCount + delta };
}
