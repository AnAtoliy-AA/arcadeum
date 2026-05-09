export type WalletCurrency = 'coins' | 'gems';
export type WalletReason = 'admin_grant' | 'admin_deduct';

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
