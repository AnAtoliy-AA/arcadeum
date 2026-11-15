export const DAILY_BONUS_BASE_COINS = 5;
export const DAILY_BONUS_STREAK_STEP = 2;
export const DAILY_BONUS_MAX_STREAK = 7;

export interface DailyBonusState {
  lastClaimDay: string | null;
  streak: number;
}

/** Local calendar day key, e.g. 2026-11-15. */
export function toDayKey(timestamp: number): string {
  const d = new Date(timestamp);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function previousDayKey(timestamp: number): string {
  const d = new Date(timestamp);
  d.setDate(d.getDate() - 1);
  return toDayKey(d.getTime());
}

export function canClaimDailyBonus(
  state: DailyBonusState,
  now: number,
): boolean {
  return state.lastClaimDay !== toDayKey(now);
}

/** Streak that a claim made `now` would produce (resets after a missed day). */
export function nextDailyStreak(state: DailyBonusState, now: number): number {
  if (state.lastClaimDay === previousDayKey(now)) {
    return Math.min(DAILY_BONUS_MAX_STREAK, state.streak + 1);
  }
  return 1;
}

export function getDailyBonusCoins(streak: number): number {
  const capped = Math.min(Math.max(1, streak), DAILY_BONUS_MAX_STREAK);
  return DAILY_BONUS_BASE_COINS + (capped - 1) * DAILY_BONUS_STREAK_STEP;
}
