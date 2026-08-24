export type Difficulty = 'beginner' | 'intermediate' | 'expert';

export interface DifficultyConfig {
  width: number;
  height: number;
  mines: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  beginner: { width: 9, height: 9, mines: 10 },
  intermediate: { width: 16, height: 16, mines: 40 },
  expert: { width: 22, height: 16, mines: 80 },
};

export type CellState = 'hidden' | 'revealed' | 'flagged';

export interface Cell {
  mine: boolean;
  /** Count of adjacent mines, computed when the board is generated. */
  adjacent: number;
  state: CellState;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface MinesweeperState {
  difficulty: Difficulty;
  width: number;
  height: number;
  mineCount: number;
  /** Row-major cell grid of length width * height. */
  cells: Cell[];
  /** False until the first reveal — the board is generated then, keeping the first click safe. */
  generated: boolean;
  status: GameStatus;
  revealedCount: number;
  flagCount: number;
}

export function cellIndex(state: Pick<MinesweeperState, 'width'>, x: number, y: number): number {
  return y * state.width + x;
}

/** Orthogonal and diagonal neighbors inside the grid bounds. */
export function neighbors(
  state: Pick<MinesweeperState, 'width' | 'height'>,
  index: number,
): number[] {
  const x = index % state.width;
  const y = Math.floor(index / state.width);
  const result: number[] = [];
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= state.width || ny < 0 || ny >= state.height) continue;
      result.push(ny * state.width + nx);
    }
  }
  return result;
}
