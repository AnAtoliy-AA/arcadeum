import {
  GRID_SIZE,
  WIN_TILE,
  emptyGrid,
  type Direction,
  type Game2048State,
  type GameStatus,
} from '../types';

const SIZE = GRID_SIZE;

/**
 * Spawns a single 2 (90%) or 4 (10%) tile in a random empty cell.
 * Returns a new grid, or the same reference when the board is full.
 */
export function spawnTile(grid: number[], rng?: () => number): number[] {
  const random = rng ?? (() => Math.random());
  const empties = grid
    .map((value, index) => (value === 0 ? index : -1))
    .filter((index) => index >= 0);
  if (empties.length === 0) return grid;

  const next = [...grid];
  const cell = empties[Math.floor(random() * empties.length)];
  next[cell] = random() < 0.9 ? 2 : 4;
  return next;
}

/** Creates a fresh game with two starting tiles. */
export function newGame(rng?: () => number): Game2048State {
  const random = rng ?? (() => Math.random());
  let grid = spawnTile(emptyGrid(), random);
  grid = spawnTile(grid, random);
  return {
    grid,
    score: 0,
    status: 'playing',
    keepPlaying: false,
    moves: 0,
  };
}

/**
 * Slides and merges one line toward its start (left). Merges happen once
 * per pair per move; returns the new line plus the points scored.
 */
export function collapseLine(line: number[]): {
  line: number[];
  gained: number;
} {
  const tiles = line.filter((value) => value !== 0);
  const result: number[] = [];
  let gained = 0;

  for (let i = 0; i < tiles.length; i += 1) {
    if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
      const merged = tiles[i] * 2;
      result.push(merged);
      gained += merged;
      i += 1;
    } else {
      result.push(tiles[i]);
    }
  }
  while (result.length < SIZE) result.push(0);
  return { line: result, gained };
}

/**
 * Reads a line in movement order. `forward` traverses start→end for
 * left/up moves; `false` reverses so collapsing can always push toward
 * the traversal origin.
 */
function extractLine(
  grid: number[],
  direction: Direction,
  position: number,
): number[] {
  const line: number[] = [];
  for (let step = 0; step < SIZE; step += 1) {
    let index: number;
    switch (direction) {
      case 'left':
        index = position * SIZE + step;
        break;
      case 'right':
        index = position * SIZE + (SIZE - 1 - step);
        break;
      case 'up':
        index = step * SIZE + position;
        break;
      case 'down':
        index = (SIZE - 1 - step) * SIZE + position;
        break;
    }
    line.push(grid[index]);
  }
  return line;
}

function writeLine(
  grid: number[],
  direction: Direction,
  position: number,
  line: number[],
): void {
  for (let step = 0; step < SIZE; step += 1) {
    let index: number;
    switch (direction) {
      case 'left':
        index = position * SIZE + step;
        break;
      case 'right':
        index = position * SIZE + (SIZE - 1 - step);
        break;
      case 'up':
        index = step * SIZE + position;
        break;
      case 'down':
        index = (SIZE - 1 - step) * SIZE + position;
        break;
    }
    grid[index] = line[step];
  }
}

/** True when at least one move (any direction) changes the board. */
export function hasAvailableMoves(grid: number[]): boolean {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const value = grid[row * SIZE + col];
      if (value === 0) return true;
      if (
        col + 1 < SIZE &&
        grid[row * SIZE + col + 1] === value
      )
        return true;
      if (
        row + 1 < SIZE &&
        grid[(row + 1) * SIZE + col] === value
      )
        return true;
    }
  }
  return false;
}

/**
 * Applies one move: slides every line, merges equal neighbors once each,
 * spawns a new tile when anything moved. Returns the same reference when
 * the move is a no-op (board unchanged).
 */
export function move(
  state: Game2048State,
  direction: Direction,
  rng?: () => number,
): Game2048State {
  if (state.status === 'lost') return state;
  if (state.status === 'won' && !state.keepPlaying) return state;

  const next = [...state.grid];
  let gainedTotal = 0;
  let movedAny = false;

  for (let position = 0; position < SIZE; position += 1) {
    const original = extractLine(state.grid, direction, position);
    const { line, gained } = collapseLine(original);
    if (gained > 0 || line.some((value, i) => value !== original[i])) {
      movedAny = true;
    }
    gainedTotal += gained;
    writeLine(next, direction, position, line);
  }

  if (!movedAny) return state;

  const reachedWin =
    state.status !== 'won' && next.some((value) => value >= WIN_TILE);
  const spawned = spawnTile(next, rng);

  let status: GameStatus = state.status;
  const keepPlaying = state.keepPlaying;
  if (reachedWin) {
    status = 'won';
  } else if (!hasAvailableMoves(spawned)) {
    status = 'lost';
  }

  return {
    grid: spawned,
    score: state.score + gainedTotal,
    status,
    keepPlaying,
    moves: state.moves + 1,
  };
}

/** Lets the player continue after reaching the 2048 tile. */
export function keepPlaying(state: Game2048State): Game2048State {
  if (state.status !== 'won' || state.keepPlaying) return state;
  return { ...state, keepPlaying: true };
}
