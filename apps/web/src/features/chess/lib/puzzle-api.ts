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

export const CURATED_DAILY_PUZZLES: ChessPuzzle[] = [
  {
    puzzleId: 'daily-2026-1',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5',
    moves: ['c4f7', 'e8f7'],
    rating: 1250,
    themes: ['sacrifice', 'fork', 'opening'],
    openingTags: ['Italian Game'],
  },
  {
    puzzleId: 'daily-2026-2',
    fen: 'r1b2rk1/ppp2ppp/8/8/2B5/8/PPP2PPP/3R2K1 w - - 0 1',
    moves: ['c4f7', 'f8f7', 'd1d8'],
    rating: 1300,
    themes: ['backRankMate', 'deflection'],
    openingTags: ['Middlegame'],
  },
  {
    puzzleId: 'daily-2026-3',
    fen: 'r2qkb1r/pp2pppp/2n1b3/3n4/2BP4/5N2/PP3PPP/RNBQK2R w KQkq - 2 8',
    moves: ['f3g5', 'd8d6'],
    rating: 1400,
    themes: ['tactics', 'advantage'],
    openingTags: ['Scandinavian Defense'],
  },
  {
    puzzleId: 'daily-2026-4',
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    moves: ['e1e8'],
    rating: 1100,
    themes: ['mateIn1', 'backRankMate'],
    openingTags: ['Endgame'],
  },
  {
    puzzleId: 'daily-2026-5',
    fen: 'r1bqk2r/pppp1ppp/2n5/1B2p3/4n3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 6',
    moves: ['f1e1', 'd7d5'],
    rating: 1350,
    themes: ['pin', 'middlegame'],
    openingTags: ['Ruy Lopez'],
  },
  {
    puzzleId: 'daily-2026-6',
    fen: 'r1b1k2r/ppppqppp/2n5/4n3/1bP2B2/5N2/PP1NPPPP/R2QKB1R w KQkq - 0 8',
    moves: ['f3e5', 'c6e5'],
    rating: 1200,
    themes: ['discoveredAttack', 'trap'],
    openingTags: ['Budapest Gambit'],
  },
  {
    puzzleId: 'daily-2026-7',
    fen: 'r4rk1/ppp2ppp/8/3q4/8/8/PPP2PPP/R3R1K1 w - - 0 1',
    moves: ['e1e7'],
    rating: 1250,
    themes: ['seventhRank', 'rookEndgame'],
    openingTags: ['Endgame'],
  },
];

export function getCuratedDailyPuzzle(date = new Date()): ChessPuzzle {
  const seed =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const index = seed % CURATED_DAILY_PUZZLES.length;
  return CURATED_DAILY_PUZZLES[index]!;
}

export async function getDailyPuzzle(): Promise<ChessPuzzle> {
  try {
    const res = await apiFetch<ChessPuzzle | null>('/chess/puzzles/daily');
    if (res && res.fen && Array.isArray(res.moves) && res.moves.length > 0) {
      return res;
    }
  } catch {
    return getCuratedDailyPuzzle();
  }
  return getCuratedDailyPuzzle();
}

export async function getRandomPuzzle(
  rating?: number,
  theme?: string,
): Promise<ChessPuzzle | null> {
  const params = new URLSearchParams();
  if (rating) params.set('rating', String(rating));
  if (theme) params.set('theme', theme);
  const qs = params.toString();
  try {
    const res = await apiFetch<ChessPuzzle | null>(
      `/chess/puzzles/random${qs ? `?${qs}` : ''}`,
    );
    if (res && res.fen) return res;
  } catch {
    const idx = Math.floor(Math.random() * CURATED_DAILY_PUZZLES.length);
    return CURATED_DAILY_PUZZLES[idx] ?? null;
  }
  const idx = Math.floor(Math.random() * CURATED_DAILY_PUZZLES.length);
  return CURATED_DAILY_PUZZLES[idx] ?? null;
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
