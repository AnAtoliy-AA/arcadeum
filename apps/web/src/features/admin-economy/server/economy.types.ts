export type EconomyKey =
  | 'game_win_coin_reward'
  | 'gem_to_coin_rate'
  | 'referral_reward_coins_per'
  | 'referral_tier_1_bonus_coins'
  | 'referral_tier_2_bonus_coins'
  | 'referral_tier_3_bonus_coins';

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
