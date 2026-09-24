export interface RatingHistoryEntry {
  timestamp: number;
  rating: number;
  change: number;
  puzzleId: string;
  puzzleRating: number;
  solved: boolean;
  motif?: string;
}

const STORAGE_RATING_KEY = 'arcadeum_chess_puzzle_rating';
const STORAGE_HISTORY_KEY = 'arcadeum_chess_puzzle_rating_history';
const DEFAULT_RATING = 1200;

export function getUserPuzzleRating(): number {
  if (typeof window === 'undefined') return DEFAULT_RATING;
  try {
    const raw = localStorage.getItem(STORAGE_RATING_KEY);
    if (!raw) return DEFAULT_RATING;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed >= 100 ? parsed : DEFAULT_RATING;
  } catch {
    return DEFAULT_RATING;
  }
}

export function getRatingHistory(): RatingHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RatingHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function calculateEloChange(
  userRating: number,
  puzzleRating: number,
  solved: boolean,
  gamesCount: number = 25,
): { newRating: number; change: number } {
  const expected = 1 / (1 + 10 ** ((puzzleRating - userRating) / 400));
  const actual = solved ? 1 : 0;
  const kFactor = gamesCount < 20 ? 40 : userRating < 2000 ? 32 : 24;
  const rawChange = Math.round(kFactor * (actual - expected));
  const change = solved ? Math.max(5, rawChange) : Math.min(-5, rawChange);
  const newRating = Math.max(100, userRating + change);

  return { newRating, change };
}

export function recordRatingUpdate(
  puzzle: { puzzleId: string; rating: number; themes?: string[] },
  solved: boolean,
): { previousRating: number; newRating: number; change: number } {
  const previousRating = getUserPuzzleRating();
  const history = getRatingHistory();
  const { newRating, change } = calculateEloChange(
    previousRating,
    puzzle.rating,
    solved,
    history.length,
  );

  const entry: RatingHistoryEntry = {
    timestamp: Date.now(),
    rating: newRating,
    change,
    puzzleId: puzzle.puzzleId,
    puzzleRating: puzzle.rating,
    solved,
    motif: puzzle.themes?.[0],
  };

  const updatedHistory = [...history.slice(-99), entry];

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_RATING_KEY, String(newRating));
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch {}
  }

  return { previousRating, newRating, change };
}

export function clearRatingHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_RATING_KEY);
    localStorage.removeItem(STORAGE_HISTORY_KEY);
  } catch {}
}
