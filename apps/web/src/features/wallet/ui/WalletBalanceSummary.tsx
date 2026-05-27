import { formatNumber } from '@/shared/i18n/formatters';
import { DEFAULT_LOCALE, type Locale } from '@/shared/config/locale-slugs';
import type { WalletBalance } from '../server/wallet.types';

interface Props {
  balance: WalletBalance;
  locale?: Locale;
}

export function WalletBalanceSummary({
  balance,
  locale = DEFAULT_LOCALE,
}: Props) {
  const { coins, gems } = balance;
  const fmt = (n: number) => formatNumber(n, locale);

  return (
    <section
      aria-label="Wallet balance"
      style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 16px 0' }}
    >
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 700,
          marginBottom: '4px',
          color: 'var(--color-text, #e4e4e7)',
        }}
      >
        Your Wallet
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary, #71717a)',
          marginBottom: '32px',
        }}
      >
        Coins are earned through play. Gems are purchased.
      </p>

      <div
        aria-label="Balance summary"
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div
          data-testid="balance-coins"
          style={{
            flex: '1 1 160px',
            padding: '20px 24px',
            borderRadius: '12px',
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.2)',
          }}
        >
          <div
            style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}
          >
            🪙 Coins
          </div>
          <div
            style={{ fontSize: '28px', fontWeight: 700, color: '#fbbf24' }}
            data-testid="balance-coins-value"
          >
            {fmt(coins)}
          </div>
        </div>

        <div
          data-testid="balance-gems"
          style={{
            flex: '1 1 160px',
            padding: '20px 24px',
            borderRadius: '12px',
            background: 'rgba(167,139,250,0.08)',
            border: '1px solid rgba(167,139,250,0.2)',
          }}
        >
          <div
            style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}
          >
            💎 Gems
          </div>
          <div
            style={{ fontSize: '28px', fontWeight: 700, color: '#a78bfa' }}
            data-testid="balance-gems-value"
          >
            {fmt(gems)}
          </div>
        </div>
      </div>
    </section>
  );
}
