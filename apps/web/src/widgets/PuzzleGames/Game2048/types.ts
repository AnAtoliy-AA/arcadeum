export type Direction = 'up' | 'down' | 'left' | 'right';

export type GameStatus = 'playing' | 'won' | 'lost';

/** Tile value that triggers the win state (classic target). */
export const WIN_TILE = 2048;

export const GRID_SIZE = 4;

export interface Game2048State {
  /** Row-major 4×4 grid; 0 marks an empty cell. */
  grid: number[];
  score: number;
  status: GameStatus;
  /** True after the player chose to keep playing past the first 2048 tile. */
  keepPlaying: boolean;
  moves: number;
}

export function emptyGrid(): number[] {
  return Array<number>(GRID_SIZE * GRID_SIZE).fill(0);
}
