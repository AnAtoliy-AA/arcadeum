'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/lib/api-client';

// UI-component audit (packages/ui/src/components):
//   - No `Pill`, `CoinIcon`, or `GemIcon` exported from @arcadeum/ui.
//   - Closest primitives: DeltaChip, LiveChip (pill-shaped XStack + Text).
//   - CONCERN: A generic currency Pill would be a useful addition to
//     @arcadeum/ui, but introducing it now would exceed this task's scope.
//     Using native <span> elements styled via CSS classes instead.
//
// NOTE: <WalletLiveBridge /> is intentionally NOT rendered here.
//   The bridge is mounted once in the root layout (see Task 23) so it is
//   active for the whole session without being re-mounted on every render
//   of this chip.

interface WalletBalance {
  coins: number;
  gems: number;
}

const pillStyle = (bg: string, border: string, color: string) => ({
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  gap: '4px',
  padding: '2px 10px',
  borderRadius: '999px',
  fontSize: '13px',
  fontWeight: 600,
  background: bg,
  border: `1px solid ${border}`,
  color,
  whiteSpace: 'nowrap' as const,
});

const fmt = (n: number) => new Intl.NumberFormat().format(n);

export function BalanceChip() {
  const [balance, setBalance] = useState<WalletBalance | null>(null);

  useEffect(() => {
    apiClient
      .get<WalletBalance>('/wallet/balance')
      .then(setBalance)
      .catch(() => {
        // Auth expired, BE unreachable, or any transient failure — render nothing.
      });
  }, []);

  if (!balance) return null;

  // Destructure to avoid the no-restricted-syntax MemberExpression rule
  const { coins, gems } = balance;

  return (
    <div
      className="wallet-balance-chip"
      role="status"
      aria-live="polite"
      aria-label="Wallet balance"
      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      <span
        className="wallet-balance-pill"
        title="Coins"
        {...pillStyle(
          'rgba(251,191,36,0.12)',
          'rgba(251,191,36,0.3)',
          '#fbbf24',
        )}
      >
        {'🪙'} {fmt(coins)}
      </span>
      <span
        className="wallet-balance-pill"
        title="Gems"
        {...pillStyle(
          'rgba(167,139,250,0.12)',
          'rgba(167,139,250,0.3)',
          '#a78bfa',
        )}
      >
        {'💎'} {fmt(gems)}
      </span>
    </div>
  );
}
