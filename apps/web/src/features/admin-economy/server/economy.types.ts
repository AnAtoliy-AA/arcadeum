export type EconomyKey =
  | 'game_win_coin_reward'
  | 'gem_to_coin_rate'
  | 'referral_reward_coins_per'
  | 'referral_tier_1_bonus_coins'
  | 'referral_tier_2_bonus_coins'
  | 'referral_tier_3_bonus_coins'
  | 'daily_reward_day_1'
  | 'daily_reward_day_2'
  | 'daily_reward_day_3'
  | 'daily_reward_day_4'
  | 'daily_reward_day_5'
  | 'daily_reward_day_6'
  | 'daily_reward_day_7'
  | 'daily_reward_day_7_bonus_gems'
  | 'shop_allow_gems'
  | 'shop_allow_arcadeum'
  | 'gems_allow_arcadeum'
  | 'gem_to_usd_rate'
  | 'arcadeum_discount_percent'
  | 'geo_block_enabled'
  | 'vpn_detection_enabled'
  | 'signup_reward_coins'
  | 'signup_reward_gems'
  | 'social_reward_gems';

export const BOOLEAN_ECONOMY_KEYS: ReadonlySet<EconomyKey> = new Set([
  'shop_allow_gems',
  'shop_allow_arcadeum',
  'gems_allow_arcadeum',
  'geo_block_enabled',
  'vpn_detection_enabled',
]);

export interface EconomySettingView {
  key: EconomyKey;
  currentValue: number;
  defaultValue: number;
  source: 'override' | 'env' | 'default';
  updatedAt: string | null;
  updatedByLabel: string | null;
}

export interface EconomyAuditView {
  id: string;
  fromValue: number;
  toValue: number;
  adminLabel: string;
  changedAt: string;
}
