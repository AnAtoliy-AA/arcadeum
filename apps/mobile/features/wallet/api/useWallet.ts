import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { resolveApiUrl } from '@/lib/apiBase';
import { fetchWithRefresh } from '@/lib/fetchWithRefresh';
import { useSessionTokens } from '@/stores/sessionTokens';

export type WalletCurrency = 'coins' | 'gems';

export interface WalletBalance {
  coins: number;
  gems: number;
}

export type WalletReason = 'admin_grant' | 'admin_deduct';

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

export function useWalletBalance() {
  const { tokens, refreshTokens } = useSessionTokens();
  const { accessToken } = tokens;

  return useQuery<WalletBalance>({
    queryKey: ['wallet', 'balance'],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const url = resolveApiUrl('/wallet/balance');
      const res = await fetchWithRefresh(
        url,
        { method: 'GET' },
        { accessToken, refreshTokens },
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch wallet balance: ${res.status}`);
      }
      return res.json() as Promise<WalletBalance>;
    },
  });
}

export function useWalletTransactions(currency?: WalletCurrency) {
  const { tokens, refreshTokens } = useSessionTokens();
  const { accessToken } = tokens;

  return useInfiniteQuery<PaginatedWalletTransactions>({
    queryKey: ['wallet', 'transactions', currency ?? 'all'],
    enabled: Boolean(accessToken),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (currency) params.set('currency', currency);
      if (pageParam) params.set('cursor', pageParam as string);
      params.set('limit', '20');
      const url = resolveApiUrl(`/wallet/transactions?${params.toString()}`);
      const res = await fetchWithRefresh(
        url,
        { method: 'GET' },
        { accessToken, refreshTokens },
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch transactions: ${res.status}`);
      }
      return res.json() as Promise<PaginatedWalletTransactions>;
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}
