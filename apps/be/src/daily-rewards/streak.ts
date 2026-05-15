import type { EconomyKey } from '../economy/economy-keys';

/**
 * Pure utilities for the daily-rewards streak. No I/O, no Mongo, no clocks
 * other than what the caller supplies — easy to unit-test and easy to reason
 * about. Kept deliberately tiny so the service can be a thin orchestrator.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Format a Date as YYYY-MM-DD using UTC accessors. The whole feature is
 * "once per UTC day" so we never want local-timezone formatting here.
 */
export function todayUtc(now: Date): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns true iff `prev` is exactly one UTC day before `today` (both in
 * YYYY-MM-DD). Robust across month/year boundaries by comparing parsed
 * UTC timestamps rather than walking the string.
 */
export function isYesterday(prev: string, today: string): boolean {
  const a = Date.parse(`${prev}T00:00:00.000Z`);
  const b = Date.parse(`${today}T00:00:00.000Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return false;
  return b - a === MS_PER_DAY;
}

/**
 * Compute the streak day that should be awarded for the next claim.
 *
 *  - no previous claim → Day 1
 *  - prev === today → throw (caller must guard with "can claim" check first)
 *  - prev was yesterday → (prevStreak % 7) + 1   (so Day 7 → Day 1 wrap)
 *  - prev was older than yesterday → Day 1       (missed-day reset)
 */
export function nextStreak(
  prevStreak: number,
  prevDay: string | null,
  today: string,
): number {
  if (prevDay === null) return 1;
  if (prevDay === today) {
    throw new Error(
      'nextStreak: previous claim was today; guard with canClaim before calling',
    );
  }
  if (isYesterday(prevDay, today)) {
    return (prevStreak % 7) + 1;
  }
  return 1;
}

/**
 * Map a streak day (1..7) to the corresponding economy key. Anything outside
 * the inclusive range is a programmer error — throw rather than silently
 * returning a bogus key.
 */
export function rewardKeyForStreak(streak: number): EconomyKey {
  if (!Number.isInteger(streak) || streak < 1 || streak > 7) {
    throw new Error(
      `rewardKeyForStreak: streak must be an integer in [1,7], got ${streak}`,
    );
  }
  return `daily_reward_day_${streak}` as EconomyKey;
}
