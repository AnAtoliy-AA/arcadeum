import { fetchReferralRewardsConfig } from '../api/referralApi';

// Default values as fallback (matches BE defaults)
const DEFAULT_COIN_REWARDS = {
  perFriend: 50,
  tier1Bonus: 100,
  tier2Bonus: 200,
  tier3Bonus: 500,
} as const;

// Cache for the rewards config
let cachedConfig: {
  data: typeof DEFAULT_COIN_REWARDS;
  timestamp: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches coin rewards from the backend, with caching and fallback to defaults.
 */
export async function getReferralCoinRewards(): Promise<
  typeof DEFAULT_COIN_REWARDS
> {
  const now = Date.now();

  // Return cached config if still valid
  if (cachedConfig && now - cachedConfig.timestamp < CACHE_TTL) {
    return cachedConfig.data;
  }

  try {
    const config = await fetchReferralRewardsConfig();
    const rewards = {
      perFriend: config.perFriend,
      tier1Bonus: config.tier1Bonus,
      tier2Bonus: config.tier2Bonus,
      tier3Bonus: config.tier3Bonus,
    };

    // Cache the config
    cachedConfig = { data: rewards, timestamp: now };

    return rewards;
  } catch {
    // Fallback to defaults on error
    return DEFAULT_COIN_REWARDS;
  }
}

// Synchronous fallback for cases where async is not possible
export const REFERRAL_COIN_REWARDS = DEFAULT_COIN_REWARDS;

/** Maps tier number (1-indexed) to its coin bonus amount. */
export const TIER_COIN_BONUS: Record<number, number> = {
  1: REFERRAL_COIN_REWARDS.tier1Bonus,
  2: REFERRAL_COIN_REWARDS.tier2Bonus,
  3: REFERRAL_COIN_REWARDS.tier3Bonus,
};
