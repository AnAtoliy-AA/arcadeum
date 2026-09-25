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

import {
  CURATED_PUZZLES,
  THEME_CATEGORIES,
  type ThemeCategoryId,
} from './curated-puzzles';

export { THEME_CATEGORIES, type ThemeCategoryId };
export const CURATED_DAILY_PUZZLES: ChessPuzzle[] = CURATED_PUZZLES;

export function getCuratedDailyPuzzle(dateInput?: Date | string): ChessPuzzle {
  const date =
    typeof dateInput === 'string'
      ? new Date(dateInput.includes('T') ? dateInput : `${dateInput}T00:00:00Z`)
      : (dateInput ?? new Date());
  const seed =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const index = seed % CURATED_DAILY_PUZZLES.length;
  return CURATED_DAILY_PUZZLES[index]!;
}

export async function getDailyPuzzle(
  dateInput?: Date | string,
): Promise<ChessPuzzle> {
  const date =
    typeof dateInput === 'string'
      ? new Date(dateInput.includes('T') ? dateInput : `${dateInput}T00:00:00Z`)
      : (dateInput ?? new Date());
  try {
    const res = await apiFetch<ChessPuzzle | null>('/chess/puzzles/daily');
    if (res && res.fen && Array.isArray(res.moves) && res.moves.length > 0) {
      return res;
    }
  } catch {}

  return getCuratedDailyPuzzle(date);
}

export async function getRandomPuzzle(
  rating?: number,
  theme?: string,
): Promise<ChessPuzzle | null> {
  const params = new URLSearchParams();
  if (rating) params.set('rating', String(rating));
  if (theme && theme !== 'all') params.set('theme', theme);
  const qs = params.toString();
  try {
    const res = await apiFetch<ChessPuzzle | null>(
      `/chess/puzzles/random${qs ? `?${qs}` : ''}`,
    );
    if (res && res.fen) return res;
  } catch {}

  return getLocalFallbackPuzzle(rating, theme);
}

export function getLocalFallbackPuzzle(
  rating?: number,
  theme?: string,
): ChessPuzzle {
  let pool = CURATED_DAILY_PUZZLES;
  if (theme && theme !== 'all') {
    const themeMatches = pool.filter((p) => p.themes.includes(theme));
    if (themeMatches.length > 0) pool = themeMatches;
  }
  if (rating && pool.length > 1) {
    const ratingMatches = pool.filter(
      (p) => Math.abs(p.rating - rating) <= 250,
    );
    if (ratingMatches.length > 0) pool = ratingMatches;
  }
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] ?? CURATED_DAILY_PUZZLES[0]!;
}

export function getInitialPuzzleSync(
  mode?: 'daily' | 'rated' | 'themed' | 'custom',
  customPuzzle?: ChessPuzzle,
  date?: Date | string,
  theme?: string,
  rating?: number,
): ChessPuzzle {
  if (customPuzzle) return customPuzzle;
  if (mode === 'daily') return getCuratedDailyPuzzle(date);
  return getLocalFallbackPuzzle(rating, theme);
}

export async function solvePuzzle(
  puzzleId: string,
  moves: string[],
  timeMs: number,
): Promise<PuzzleSolveResult> {
  try {
    return await apiFetch<PuzzleSolveResult>('/chess/puzzles/solve', {
      method: 'POST',
      body: JSON.stringify({ puzzleId, moves, timeMs }),
    });
  } catch {
    return {
      solved: true,
      ratingChange: 10,
      puzzle: null,
    };
  }
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
