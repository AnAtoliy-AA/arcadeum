'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/shared/lib/api-client';
import { useRoutes } from '@/shared/config/useRoutes';

interface WalletBalance {
  coins: number;
  gems: number;
}

const fmt = (n: number) => new Intl.NumberFormat().format(n);

export function BalanceChip() {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const routes = useRoutes();

  useEffect(() => {
    apiClient
      .get<WalletBalance>('/wallet/balance')
      .then(setBalance)
      .catch(() => {});
  }, []);

  if (!balance) return null;

  const { coins, gems } = balance;

  return (
    <Link
      href={routes.wallet}
      className="wallet-balance-chip flex items-center gap-2 px-2.5 py-1 rounded-full border border-[var(--glassBorder)] bg-[var(--glassBg)] hover:bg-[var(--backgroundHover)] transition-all duration-200 no-underline text-xs"
      role="status"
      aria-live="polite"
      aria-label="Wallet balance"
      data-testid="header-wallet-balance"
    >
      <span
        className="wallet-balance-pill flex items-center gap-1 font-semibold text-amber-400"
        title="Coins"
      >
        <span>🪙</span>
        <span>{fmt(coins)}</span>
      </span>
      <span className="text-[var(--glassBorder)] font-light leading-none">
        |
      </span>
      <span
        className="wallet-balance-pill flex items-center gap-1 font-semibold text-purple-400"
        title="Gems"
      >
        <span>💎</span>
        <span>{fmt(gems)}</span>
      </span>
    </Link>
  );
}
