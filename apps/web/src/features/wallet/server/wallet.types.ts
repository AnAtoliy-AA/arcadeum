export type WalletCurrency = 'coins' | 'gems';
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
  | 'referral_tier_bonus';

export interface WalletBalance {
  coins: number;
  gems: number;
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
