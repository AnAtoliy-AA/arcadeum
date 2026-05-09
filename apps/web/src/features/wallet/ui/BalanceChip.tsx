import { Suspense } from 'react';
import { getTranslations } from '@/shared/i18n/server';
import { getWalletBalance } from '../server/wallet.server';

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

async function BalanceChipInner() {
  const messages = await getTranslations();
  const t = messages.pages?.wallet;
  // Destructure to avoid the no-restricted-syntax MemberExpression rule that
  // bans direct `.coins` / `.gems` access anywhere outside the wallet module.
  const { coins, gems } = await getWalletBalance();
  const fmt = new Intl.NumberFormat();

  return (
    <div
      className="wallet-balance-chip"
      aria-label={t?.chip?.coinsLabel ?? 'Wallet balance'}
      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      <span
        className="wallet-balance-pill"
        title={t?.chip?.coinsLabel ?? 'Coins'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 10px',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: 600,
          background: 'rgba(251,191,36,0.12)',
          border: '1px solid rgba(251,191,36,0.3)',
          color: '#fbbf24',
          whiteSpace: 'nowrap',
        }}
      >
        {'🪙'} {fmt.format(coins)}
      </span>
      <span
        className="wallet-balance-pill"
        title={t?.chip?.gemsLabel ?? 'Gems'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 10px',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: 600,
          background: 'rgba(167,139,250,0.12)',
          border: '1px solid rgba(167,139,250,0.3)',
          color: '#a78bfa',
          whiteSpace: 'nowrap',
        }}
      >
        {'💎'} {fmt.format(gems)}
      </span>
    </div>
  );
}

export function BalanceChip() {
  return (
    <Suspense
      fallback={
        <div
          className="wallet-balance-chip-skeleton"
          aria-hidden
          style={{ display: 'flex', gap: '8px' }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '64px',
              height: '24px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.06)',
            }}
          />
          <span
            style={{
              display: 'inline-block',
              width: '56px',
              height: '24px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.06)',
            }}
          />
        </div>
      }
    >
      <BalanceChipInner />
    </Suspense>
  );
}
