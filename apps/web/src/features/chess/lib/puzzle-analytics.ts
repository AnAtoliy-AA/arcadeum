import type { ChessPuzzle } from './puzzle-api';

const ANALYTICS_KEY = 'arcadeum_puzzle_analytics_stats';
const MISTAKES_KEY = 'arcadeum_puzzle_mistakes';

export interface ThemeStat {
  theme: string;
  attempts: number;
  solved: number;
  accuracy: number;
}

export interface OverallAnalytics {
  totalAttempts: number;
  totalSolved: number;
  currentStreak: number;
  bestStreak: number;
  themeStats: Record<string, { attempts: number; solved: number }>;
}

export interface FailedPuzzleRecord {
  puzzle: ChessPuzzle;
  failedAt: number;
  wrongMoves: string[];
}

export function loadAnalytics(): OverallAnalytics {
  if (typeof window === 'undefined') {
    return {
      totalAttempts: 0,
      totalSolved: 0,
      currentStreak: 0,
      bestStreak: 0,
      themeStats: {},
    };
  }

  try {
    const raw = window.localStorage.getItem(ANALYTICS_KEY);
    if (!raw) {
      return {
        totalAttempts: 0,
        totalSolved: 0,
        currentStreak: 0,
        bestStreak: 0,
        themeStats: {},
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      totalAttempts: 0,
      totalSolved: 0,
      currentStreak: 0,
      bestStreak: 0,
      themeStats: {},
    };
  }
}

export function saveAnalytics(stats: OverallAnalytics): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(stats));
  } catch {}
}

export function recordPuzzleResult(
  puzzle: ChessPuzzle,
  solved: boolean,
  movesAttempted: string[] = [],
): void {
  const current = loadAnalytics();
  current.totalAttempts += 1;

  if (solved) {
    current.totalSolved += 1;
    current.currentStreak += 1;
    if (current.currentStreak > current.bestStreak) {
      current.bestStreak = current.currentStreak;
    }
  } else {
    current.currentStreak = 0;
    addMistakeToQueue(puzzle, movesAttempted);
  }

  const themes =
    puzzle.themes && puzzle.themes.length > 0 ? puzzle.themes : ['tactics'];
  for (const t of themes) {
    if (!current.themeStats[t]) {
      current.themeStats[t] = { attempts: 0, solved: 0 };
    }
    const entry = current.themeStats[t]!;
    entry.attempts += 1;
    if (solved) {
      entry.solved += 1;
    }
  }

  saveAnalytics(current);
}

export function getPuzzleAnalytics(): {
  overall: OverallAnalytics;
  themeBreakdown: ThemeStat[];
  weakestTheme: string | null;
} {
  const stats = loadAnalytics();
  const themeBreakdown: ThemeStat[] = Object.entries(stats.themeStats).map(
    ([theme, data]) => ({
      theme,
      attempts: data.attempts,
      solved: data.solved,
      accuracy:
        data.attempts > 0 ? Math.round((data.solved / data.attempts) * 100) : 0,
    }),
  );

  themeBreakdown.sort((a, b) => b.attempts - a.attempts);

  let weakestTheme: string | null = null;
  let lowestAcc = 101;
  for (const item of themeBreakdown) {
    if (item.attempts >= 3 && item.accuracy < lowestAcc) {
      lowestAcc = item.accuracy;
      weakestTheme = item.theme;
    }
  }

  return {
    overall: stats,
    themeBreakdown,
    weakestTheme,
  };
}

export function loadMistakesQueue(): FailedPuzzleRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(MISTAKES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMistakesQueue(queue: FailedPuzzleRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MISTAKES_KEY, JSON.stringify(queue));
  } catch {}
}

export function addMistakeToQueue(
  puzzle: ChessPuzzle,
  wrongMoves: string[] = [],
): void {
  const queue = loadMistakesQueue();
  const existingIdx = queue.findIndex(
    (m) => m.puzzle.puzzleId === puzzle.puzzleId,
  );
  const record: FailedPuzzleRecord = {
    puzzle,
    failedAt: Date.now(),
    wrongMoves,
  };

  if (existingIdx >= 0) {
    queue[existingIdx] = record;
  } else {
    queue.unshift(record);
  }

  if (queue.length > 100) {
    queue.splice(100);
  }

  saveMistakesQueue(queue);
}

export function removeMistakeFromQueue(puzzleId: string): void {
  const queue = loadMistakesQueue();
  const filtered = queue.filter((m) => m.puzzle.puzzleId !== puzzleId);
  saveMistakesQueue(filtered);
}

export function clearMistakesQueue(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(MISTAKES_KEY);
}

export function playTacticsAudio(
  type: 'solve' | 'fail' | 'fanfare' | 'streak',
): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'solve') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (type === 'fail') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.22);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } else if (type === 'fanfare' || type === 'streak') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.12, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.31);
      });
    }
  } catch {}
}
