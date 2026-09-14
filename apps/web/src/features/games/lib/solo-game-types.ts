export interface SoloGameFinishedInfo {
  won: boolean;
  score: number;
  moves: number;
  durationMs: number;
}

export interface BaseSoloStoreState<T> {
  game: T;
  startedAt: number;
  finishedAt: number | null;
  finished: SoloGameFinishedInfo | null;
  history: T[];
  usedUndo: boolean;
  undo: () => void;
  newGame: () => void;
}

export interface SoloGameMoveResult {
  game: unknown;
  /** If set, the game just ended. */
  finishedAt?: number;
  finished?: SoloGameFinishedInfo;
}

export const SOLO_RATING_DIFFICULTY_MAP: Record<string, number> = {
  beginner: 6,
  easy: 6,
  default: 10,
  intermediate: 10,
  medium: 10,
  hard: 16,
  expert: 16,
};

export function soloRatingBaseGain(difficulty: string): number {
  return SOLO_RATING_DIFFICULTY_MAP[difficulty] ?? 10;
}

export function soloRatingDelta(
  difficulty: string,
  won: boolean,
  usedUndo: boolean,
): number {
  const base = soloRatingBaseGain(difficulty);
  if (won) {
    return usedUndo ? Math.round(base * 0.5) : base;
  }
  const loss = usedUndo ? Math.round(base * 0.75) : base;
  return -loss;
}
