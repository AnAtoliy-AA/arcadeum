import Link from 'next/link';
import { formatNumber } from '@/shared/i18n/formatters';
import { DEFAULT_LOCALE, type Locale } from '@/shared/config/locale-slugs';
import type {
  WalletBalance,
  WalletCurrency,
  PaginatedWalletTransactions,
} from '../server/wallet.types';
import { TransactionRow } from './TransactionRow';

interface Props {
  balance: WalletBalance;
  page: PaginatedWalletTransactions;
  currency?: WalletCurrency;
  locale?: Locale;
}

const PILL_BASE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 14px',
  borderRadius: '999px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
  whiteSpace: 'nowrap' as const,
  transition: 'background 0.15s, border-color 0.15s',
};

const FILTER_ACTIVE: React.CSSProperties = {
  ...PILL_BASE,
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.25)',
  color: '#fff',
};

const FILTER_INACTIVE: React.CSSProperties = {
  ...PILL_BASE,
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#a1a1aa',
};

export function WalletPageView({
  balance,
  page,
  currency,
  locale = DEFAULT_LOCALE,
}: Props) {
  // Destructure to avoid the no-restricted-syntax member-access rule for
  // .coins / .gems.
  const { coins, gems } = balance;
  const fmt = (n: number) => formatNumber(n, locale);
  const { items, nextCursor } = page;

  // Currency filter links reset the cursor when changing filter.
  const allHref = '/wallet';
  const coinsHref = '/wallet?currency=coins';
  const gemsHref = '/wallet?currency=gems';

  const isAll = !currency;
  const isCoins = currency === 'coins';
  const isGems = currency === 'gems';

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Page title */}
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

      {/* Balance summary */}
      <section
        aria-label="Balance summary"
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '32px',
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
      </section>

      {/* Currency filters */}
      <nav
        aria-label="Transaction filters"
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <Link
          href={allHref}
          style={isAll ? FILTER_ACTIVE : FILTER_INACTIVE}
          data-testid="filter-all"
        >
          All
        </Link>
        <Link
          href={coinsHref}
          style={isCoins ? FILTER_ACTIVE : FILTER_INACTIVE}
          data-testid="filter-coins"
        >
          🪙 Coins
        </Link>
        <Link
          href={gemsHref}
          style={isGems ? FILTER_ACTIVE : FILTER_INACTIVE}
          data-testid="filter-gems"
        >
          💎 Gems
        </Link>
      </nav>

      {/* Transaction list */}
      {items.length === 0 ? (
        <div
          data-testid="wallet-empty"
          style={{
            textAlign: 'center',
            padding: '64px 16px',
            color: '#71717a',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🪙</div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '4px',
              color: '#a1a1aa',
            }}
          >
            No transactions yet
          </div>
          <div style={{ fontSize: '14px' }}>
            Your wallet activity will appear here.
          </div>
        </div>
      ) : (
        <div
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <table
            data-testid="transactions-table"
            style={{ width: '100%', borderCollapse: 'collapse' }}
          >
            <thead>
              <tr
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {(['Reason', 'Change', 'Balance after', 'When'] as const).map(
                  (col) => (
                    <th
                      key={col}
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: '#71717a',
                      }}
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} locale={locale} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {nextCursor && (
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <Link
            href={`/wallet?${currency ? `currency=${currency}&` : ''}cursor=${nextCursor}`}
            data-testid="next-page"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 20px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#e4e4e7',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Next →
          </Link>
        </div>
      )}
    </main>
  );
}
