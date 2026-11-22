export const DAILY_BONUS_BASE_COINS = 5;
export const DAILY_BONUS_STREAK_STEP = 2;
export const DAILY_BONUS_MAX_STREAK = 7;

export interface DailyBonusState {
  lastClaimDay: string | null;
  streak: number;
}

/** UTC calendar day key, e.g. 2026-11-15 (server and client agree). */
export function toDayKey(timestamp: number): string {
  const d = new Date(timestamp);
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${d.getUTCFullYear()}-${month}-${day}`;
}

function previousDayKey(timestamp: number): string {
  const d = new Date(timestamp);
  d.setUTCDate(d.getUTCDate() - 1);
  return toDayKey(d.getTime());
}

export function canClaimDailyBonus(
  state: DailyBonusState,
  now: number,
): boolean {
  // ISO day keys sort lexically; a claim day in the future (clock moved
  // backwards) must not allow a second claim.
  return state.lastClaimDay === null || toDayKey(now) > state.lastClaimDay;
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
