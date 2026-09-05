import { resolveApiUrl } from '@/shared/lib/api-base';

export interface ChessPuzzle {
  puzzleId: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
  openingTags: string[];
}

export interface PuzzleStats {
  totalSolved: number;
  totalAttempted: number;
  streak: number;
  rating: number;
}

export interface PuzzleSolveResult {
  solved: boolean;
  ratingChange: number;
  puzzle: ChessPuzzle | null;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = resolveApiUrl(path);
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function getDailyPuzzle(): Promise<ChessPuzzle | null> {
  return apiFetch('/chess/puzzles/daily');
}

export async function getRandomPuzzle(
  rating?: number,
  theme?: string,
): Promise<ChessPuzzle | null> {
  const params = new URLSearchParams();
  if (rating) params.set('rating', String(rating));
  if (theme) params.set('theme', theme);
  const qs = params.toString();
  return apiFetch(`/chess/puzzles/random${qs ? `?${qs}` : ''}`);
}

export async function solvePuzzle(
  puzzleId: string,
  moves: string[],
  timeMs: number,
): Promise<PuzzleSolveResult> {
  return apiFetch('/chess/puzzles/solve', {
    method: 'POST',
    body: JSON.stringify({ puzzleId, moves, timeMs }),
  });
}

export async function getPuzzleStats(): Promise<PuzzleStats> {
  return apiFetch('/chess/puzzles/stats');
}

export async function getPuzzleThemes(): Promise<
  Array<{ theme: string; count: number }>
> {
  return apiFetch('/chess/puzzles/themes');
}

export async function getPuzzleSet(
  theme: string,
  count?: number,
): Promise<ChessPuzzle[]> {
  const params = new URLSearchParams({ theme });
  if (count) params.set('count', String(count));
  return apiFetch(`/chess/puzzles/set?${params.toString()}`);
}
