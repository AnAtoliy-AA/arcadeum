import type {
  WalletTransactionView,
  WalletReason,
} from '../server/wallet.types';

// Reason label map — keys match WalletReason union.
const REASON_LABELS: Record<WalletReason, string> = {
  admin_grant: 'Granted by admin',
  admin_deduct: 'Deducted by admin',
};

interface Props {
  tx: WalletTransactionView;
  /** Translated reason labels from the wallet i18n namespace (optional). */
  reasonLabels?: Partial<Record<WalletReason, string>>;
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export function TransactionRow({ tx, reasonLabels }: Props) {
  const { currency, delta, balanceAfter, reason, createdAt } = tx;
  const isPositive = delta > 0;
  const fmt = new Intl.NumberFormat();

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
        {fmt.format(Math.abs(delta))}
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
        {fmt.format(balanceAfter)}
      </td>
      <td
        style={{
          padding: '10px 16px',
          fontSize: '12px',
          color: 'var(--color-text-secondary, #71717a)',
          whiteSpace: 'nowrap',
        }}
        title={new Date(createdAt).toLocaleString()}
      >
        {formatRelativeDate(createdAt)}
      </td>
    </tr>
  );
}
