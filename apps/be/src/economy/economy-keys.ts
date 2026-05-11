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
  daily_reward_day_1: { env: 'DAILY_REWARD_DAY_1', default: 10 },
  daily_reward_day_2: { env: 'DAILY_REWARD_DAY_2', default: 20 },
  daily_reward_day_3: { env: 'DAILY_REWARD_DAY_3', default: 35 },
  daily_reward_day_4: { env: 'DAILY_REWARD_DAY_4', default: 55 },
  daily_reward_day_5: { env: 'DAILY_REWARD_DAY_5', default: 80 },
  daily_reward_day_6: { env: 'DAILY_REWARD_DAY_6', default: 110 },
  daily_reward_day_7: { env: 'DAILY_REWARD_DAY_7', default: 150 },
} as const;

export type EconomyKey = keyof typeof ECONOMY_KEYS_CONFIG;

export const ECONOMY_KEYS = Object.keys(
  ECONOMY_KEYS_CONFIG,
) as readonly EconomyKey[];

export function isEconomyKey(key: string): key is EconomyKey {
  return (ECONOMY_KEYS as readonly string[]).includes(key);
}
