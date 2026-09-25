import type { Board } from '@arcadeum/games-core/games/chess/chess.types';

export interface BlindfoldConfig {
  enabled: boolean;
  isPeeking: boolean;
  peekCount: number;
}

const STORAGE_BLINDFOLD_KEY = 'arcadeum_chess_puzzle_blindfold';

export function getSavedBlindfoldPreference(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_BLINDFOLD_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveBlindfoldPreference(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_BLINDFOLD_KEY, enabled ? 'true' : 'false');
  } catch {}
}

export function transformBoardForBlindfold(
  board: Board | null | undefined,
  isBlindfold: boolean,
  isPeeking: boolean,
): Board | null {
  if (!board) return null;
  if (!isBlindfold || isPeeking) return board;

  return board.map((row) => row.map(() => null));
}
