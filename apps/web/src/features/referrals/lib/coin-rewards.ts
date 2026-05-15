// TODO(ARC-619+): replace with values fetched from a BE endpoint so admin
// env-var tuning stays in sync with the FE display. For now, mirrors the
// BE defaults documented in apps/be/.env.example.
export const REFERRAL_COIN_REWARDS = {
  perFriend: 50,
  tier1Bonus: 100,
  tier2Bonus: 200,
  tier3Bonus: 500,
} as const;

/** Maps tier number (1-indexed) to its coin bonus amount. */
export const TIER_COIN_BONUS: Record<number, number> = {
  1: REFERRAL_COIN_REWARDS.tier1Bonus,
  2: REFERRAL_COIN_REWARDS.tier2Bonus,
  3: REFERRAL_COIN_REWARDS.tier3Bonus,
};
