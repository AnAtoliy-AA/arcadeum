/**
 * Mirrors `DailyRewardStatus` from
 * `apps/be/src/daily-rewards/daily-rewards.service.ts`. Keep these field names
 * and types in lock-step with the BE response — any drift surfaces in the UI
 * as silent missing data.
 */
export interface DailyRewardStatus {
  /** True iff the user has not yet claimed today (UTC). */
  canClaim: boolean;
  /** The streak day (1..7) that the next successful claim will award. */
  nextDay: number;
  /** Streak day of the user's most recent successful claim. 0 if none. */
  currentStreak: number;
  /** Coin amount the next claim will pay out (snapshot of the economy key). */
  nextRewardCoins: number;
  /** Gem amount the next claim will pay out. Only > 0 on Day 7. */
  nextRewardGems: number;
  /** ISO timestamp of the next UTC midnight — when canClaim flips back. */
  nextResetAt: string;
}

/**
 * Mirrors `DailyRewardClaimResult` from the BE service. Returned by
 * `POST /daily-rewards/claim` on success.
 */
export interface DailyRewardClaimResult {
  awardedCoins: number;
  awardedGems: number;
  currentStreak: number;
  coinsBalanceAfter: number;
  /** Only populated when awardedGems > 0; null otherwise. */
  gemsBalanceAfter: number | null;
}
