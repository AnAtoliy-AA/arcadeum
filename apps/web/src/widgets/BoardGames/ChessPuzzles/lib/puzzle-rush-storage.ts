import { useSyncExternalStore } from 'react';
import type { RushMode } from '../ui/PuzzleRushMenu';

const emptySubscribe = () => () => {};

function getHighScoresSnapshot(): string {
  if (typeof window === 'undefined') return '0:0';
  try {
    const s = localStorage.getItem('arcadeum_rush_best_survival') ?? '0';
    const tm = localStorage.getItem('arcadeum_rush_best_timed') ?? '0';
    return `${s}:${tm}`;
  } catch {
    return '0:0';
  }
}

function getHighScoresServerSnapshot(): string {
  return '0:0';
}

export function useRushHighScores(): Record<RushMode, number> {
  const raw = useSyncExternalStore(
    emptySubscribe,
    getHighScoresSnapshot,
    getHighScoresServerSnapshot,
  );
  const [sStr, tmStr] = raw.split(':');
  const s = parseInt(sStr ?? '0', 10);
  const tm = parseInt(tmStr ?? '0', 10);
  return {
    survival: isNaN(s) ? 0 : s,
    timed: isNaN(tm) ? 0 : tm,
  };
}

export function saveRushHighScore(mode: RushMode, score: number): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `arcadeum_rush_best_${mode}`;
    const prev = parseInt(localStorage.getItem(key) ?? '0', 10);
    if (isNaN(prev) || score > prev) {
      localStorage.setItem(key, String(score));
    }
  } catch {}
}
