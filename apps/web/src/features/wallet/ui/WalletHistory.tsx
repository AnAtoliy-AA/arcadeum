import Link from 'next/link';
import { DEFAULT_LOCALE, type Locale } from '@/shared/config/locale-slugs';
import { getTranslations } from '@/shared/i18n/server';
import type {
  WalletCurrency,
  WalletReason,
  PaginatedWalletTransactions,
} from '../server/wallet.types';
import { TransactionRow } from './TransactionRow';

interface Props {
  page: PaginatedWalletTransactions;
  currency?: WalletCurrency;
  locale?: Locale;
  reasonLabels?: Partial<Record<WalletReason, string>>;
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

export async function WalletHistory({
  page,
  currency,
  locale = DEFAULT_LOCALE,
  reasonLabels,
}: Props) {
  const { items, nextCursor } = page;

  let history: {
    filterAll: string;
    filterCoins: string;
    filterGems: string;
    emptyTitle: string;
    emptyDescription: string;
    colReason: string;
    colChange: string;
    colBalanceAfter: string;
    colWhen: string;
    nextPage: string;
  } | null = null;
  try {
    const messages = await getTranslations(locale);
    history = messages.wallet?.history ?? null;
  } catch {
    // Fallback to defaults
  }

  const allHref = '/wallet';
  const coinsHref = '/wallet?currency=coins';
  const gemsHref = '/wallet?currency=gems';

  const isAll = !currency;
  const isCoins = currency === 'coins';
  const isGems = currency === 'gems';

  return (
    <section
      id="wallet-history"
      aria-label="Transaction history"
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '0 16px 32px',
        scrollMarginTop: '16px',
      }}
    >
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
          {history?.filterAll ?? 'All'}
        </Link>
        <Link
          href={coinsHref}
          style={isCoins ? FILTER_ACTIVE : FILTER_INACTIVE}
          data-testid="filter-coins"
        >
          🪙 {history?.filterCoins ?? 'Coins'}
        </Link>
        <Link
          href={gemsHref}
          style={isGems ? FILTER_ACTIVE : FILTER_INACTIVE}
          data-testid="filter-gems"
        >
          💎 {history?.filterGems ?? 'Gems'}
        </Link>
      </nav>

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
            {history?.emptyTitle ?? 'No transactions yet'}
          </div>
          <div style={{ fontSize: '14px' }}>
            {history?.emptyDescription ?? 'Your wallet activity will appear here.'}
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
                {([
                  { key: 'reason', fallback: 'Reason' },
                  { key: 'change', fallback: 'Change' },
                  { key: 'balanceAfter', fallback: 'Balance after' },
                  { key: 'when', fallback: 'When' },
                ] as const).map(({ key, fallback }) => {
                  const label =
                    key === 'reason'
                      ? history?.colReason
                      : key === 'change'
                        ? history?.colChange
                        : key === 'balanceAfter'
                          ? history?.colBalanceAfter
                          : history?.colWhen;
                  return (
                    <th
                      key={key}
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
                      {label ?? fallback}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {items.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  locale={locale}
                  reasonLabels={reasonLabels}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {nextCursor && (
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <Link
            href={`/wallet?${currency ? `currency=${currency}&` : ''}cursor=${nextCursor}#wallet-history`}
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
            {history?.nextPage ?? 'Next'} →
          </Link>
        </div>
      )}
    </section>
  );
}
