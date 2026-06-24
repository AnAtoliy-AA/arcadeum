export type WalletCurrency = 'coins' | 'gems' | 'arcadeum';
export type WalletReason =
  | 'admin_grant'
  | 'admin_deduct'
  | 'game_win'
  | 'tournament_entry'
  | 'tournament_refund'
  | 'tournament_prize'
  | 'gem_purchase'
  | 'gem_to_coin_conversion_debit'
  | 'gem_to_coin_conversion_credit'
  | 'referral_bonus'
  | 'referral_tier_bonus'
  | 'daily_reward'
  | 'shop_purchase'
  | 'shop_purchase_arc'
  | 'shop_sell_refund'
  | 'battle_pass_reward'
  | 'achievement'
  | 'daily_challenge'
  | 'token_purchase'
  | 'tournament_token_prize'
  | 'wager_entry'
  | 'wager_prize'
  | 'wager_fee';

export interface WalletBalance {
  coins: number;
  gems: number;
  arcadeum: number;
}

export interface WalletTransactionView {
  id: string;
  currency: WalletCurrency;
  delta: number;
  balanceAfter: number;
  reason: WalletReason;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface PaginatedWalletTransactions {
  items: WalletTransactionView[];
  nextCursor: string | null;
}
