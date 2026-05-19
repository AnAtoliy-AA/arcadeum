import {
  formatNumber,
  formatRelative,
  formatDateTime,
} from '@/shared/i18n/formatters';
import { DEFAULT_LOCALE, type Locale } from '@/shared/config/locale-slugs';
import type {
  WalletTransactionView,
  WalletReason,
} from '../server/wallet.types';

// Reason label map — keys match WalletReason union.
const REASON_LABELS: Record<WalletReason, string> = {
  admin_grant: 'Granted by admin',
  admin_deduct: 'Deducted by admin',
  game_win: 'Game win',
  tournament_entry: 'Tournament entry',
  tournament_refund: 'Tournament refund',
  tournament_prize: 'Tournament prize',
  gem_purchase: 'Gems purchased',
  gem_to_coin_conversion_debit: 'Converted gems to coins',
  gem_to_coin_conversion_credit: 'Coins from conversion',
  referral_bonus: 'Referral bonus',
  referral_tier_bonus: 'Referral tier bonus',
};

interface Props {
  tx: WalletTransactionView;
  /** Translated reason labels from the wallet i18n namespace (optional). */
  reasonLabels?: Partial<Record<WalletReason, string>>;
  locale?: Locale;
}

export function TransactionRow({
  tx,
  reasonLabels,
  locale = DEFAULT_LOCALE,
}: Props) {
  const { currency, delta, balanceAfter, reason, createdAt } = tx;
  const isPositive = delta > 0;
  const fmt = (n: number) => formatNumber(n, locale);

  const deltaColor = isPositive ? '#4ade80' : '#f87171';
  const deltaSign = isPositive ? '+' : '';
  const currencyIcon = currency === 'coins' ? '🪙' : '💎';
  const label = reasonLabels?.[reason] ?? REASON_LABELS[reason] ?? reason;

  return (
    <tr
      data-testid="transaction-row"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        transition: 'background 0.15s',
      }}
    >
      <td
        style={{
          padding: '10px 16px',
          fontSize: '13px',
          color: 'var(--color-text-secondary, #a1a1aa)',
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: '10px 16px',
          fontSize: '13px',
          fontWeight: 600,
          color: deltaColor,
          whiteSpace: 'nowrap',
        }}
        data-testid="tx-delta"
      >
        {currencyIcon} {deltaSign}
        {fmt(Math.abs(delta))}
      </td>
      <td
        style={{
          padding: '10px 16px',
          fontSize: '13px',
          color: 'var(--color-text, #e4e4e7)',
          whiteSpace: 'nowrap',
        }}
        data-testid="tx-balance-after"
      >
        {fmt(balanceAfter)}
      </td>
      <td
        style={{
          padding: '10px 16px',
          fontSize: '12px',
          color: 'var(--color-text-secondary, #71717a)',
          whiteSpace: 'nowrap',
        }}
        title={formatDateTime(createdAt, locale)}
      >
        {formatRelative(createdAt, locale)}
      </td>
    </tr>
  );
}
