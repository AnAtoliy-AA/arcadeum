/**
 * Natural-looking bot think time. Bots used to move the instant their
 * search finished (often a few milliseconds), which feels robotic.
 */
import type { AiDifficulty } from '../../lib/ai-difficulty';
import type { ChessState } from './chess.types';
import { getRemainingMs, isDailyClock } from './chess-clock';

const DIFFICULTY_FACTOR: Record<AiDifficulty, number> = {
  beginner: 0.8,
  easy: 0.85,
  intermediate: 0.9,
  medium: 1,
  advanced: 1.1,
  strong: 1.15,
  hard: 1.2,
  master: 1.3,
  expert: 1.3,
};

/** Shortest pause, so even forced replies are not instant. */
export const MIN_THINK_MS = 250;

/**
 * Target wall-clock time (ms) before the bot plays its move.
 * - forced moves and the opening are quick; middlegame moves vary more,
 *   skewed towards short thinks with an occasional long one;
 * - stronger bots take slightly longer;
 * - in timed games it never spends more than a small slice of its clock,
 *   and plays almost instantly when nearly out of time.
 */
export function computeBotThinkTimeMs(
  state: Pick<
    ChessState,
    | 'moveHistory'
    | 'botDifficulty'
    | 'clocks'
    | 'timeControl'
    | 'currentTurnColor'
  >,
  legalMoveCount: number,
  rand: () => number = Math.random,
): number {
  const ply = state.moveHistory.length;
  let lo: number;
  let hi: number;
  if (legalMoveCount <= 1) {
    lo = 300;
    hi = 800;
  } else if (ply < 8) {
    lo = 500;
    hi = 1_400;
  } else {
    lo = 900;
    hi = 3_200;
  }
  const factor = DIFFICULTY_FACTOR[state.botDifficulty ?? 'medium'] ?? 1;
  let think = (lo + (hi - lo) * Math.pow(rand(), 1.6)) * factor;

  const clock = state.clocks?.[state.currentTurnColor];
  if (clock && !isDailyClock(state)) {
    const remaining = getRemainingMs(clock);
    const incrementMs = (state.timeControl?.incrementSeconds ?? 0) * 1000;
    const budget = remaining / 40 + incrementMs * 0.8;
    think = Math.min(think, budget);
    if (remaining < 10_000) think = Math.min(think, MIN_THINK_MS);
  }
  return Math.round(Math.max(MIN_THINK_MS, think));
}
