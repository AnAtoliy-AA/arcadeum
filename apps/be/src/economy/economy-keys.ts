/**
 * Registry of all runtime-tunable economy values.
 *
 * Each key has an env-var name (used as the fallback when no DB override
 * exists) and a code-level default (used when neither DB nor env is set).
 * Adding a new knob is a single entry in this map.
 */
export const ECONOMY_KEYS_CONFIG = {
  game_win_coin_reward: { env: 'GAME_WIN_COIN_REWARD', default: 50 },
  gem_to_coin_rate: { env: 'GEM_TO_COIN_RATE', default: 100 },
  referral_reward_coins_per: {
    env: 'REFERRAL_REWARD_COINS_PER',
    default: 50,
  },
  referral_tier_1_bonus_coins: {
    env: 'REFERRAL_TIER_1_BONUS_COINS',
    default: 100,
  },
  referral_tier_2_bonus_coins: {
    env: 'REFERRAL_TIER_2_BONUS_COINS',
    default: 200,
  },
  referral_tier_3_bonus_coins: {
    env: 'REFERRAL_TIER_3_BONUS_COINS',
    default: 500,
  },
} as const;

export type EconomyKey = keyof typeof ECONOMY_KEYS_CONFIG;

export const ECONOMY_KEYS = Object.keys(
  ECONOMY_KEYS_CONFIG,
) as readonly EconomyKey[];

export function isEconomyKey(key: string): key is EconomyKey {
  return (ECONOMY_KEYS as readonly string[]).includes(key);
}
