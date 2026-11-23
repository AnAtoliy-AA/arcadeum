import 'server-only';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type {
  PaginatedWalletTransactions,
  WalletBalance,
  WalletCurrency,
} from './wallet.types';

export class WalletUnauthorizedError extends Error {
  constructor() {
    super('Wallet fetch unauthorized (401)');
    this.name = 'WalletUnauthorizedError';
  }
}

async function fetchWithAuth<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await serverAuthFetch(path, init);

  if (!res.ok) {
    if (res.status === 401) {
      throw new WalletUnauthorizedError();
    }
    const body = await res.text();
    throw new Error(`Wallet fetch failed: ${res.status} ${body}`);
  }
  return (await res.json()) as T;
}

export async function getWalletBalance(): Promise<WalletBalance> {
  return fetchWithAuth<WalletBalance>('/wallet/balance');
}

export async function getWalletTransactions(opts: {
  currency?: WalletCurrency;
  cursor?: string;
  limit?: number;
}): Promise<PaginatedWalletTransactions> {
  const params = new URLSearchParams();
  if (opts.currency) params.set('currency', opts.currency);
  if (opts.cursor) params.set('cursor', opts.cursor);
  if (opts.limit) params.set('limit', String(opts.limit));
  const qs = params.toString();
  return fetchWithAuth<PaginatedWalletTransactions>(
    `/wallet/transactions${qs ? `?${qs}` : ''}`,
  );
}
