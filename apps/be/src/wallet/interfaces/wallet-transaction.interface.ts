import type { WalletCurrency, WalletReason } from './wallet-types';

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
