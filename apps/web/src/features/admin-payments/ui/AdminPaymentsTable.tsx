'use client';
import { Button, GlassCard } from '@arcadeum/ui';
import { Spinner } from '@/shared/ui/CSSSpinner';
import type { AdminPaymentNoteItem } from '../api';

export interface AdminPaymentsTableLabels {
  empty: { noNotes: string; noResults: string };
  pagination: { prev: string; next: string; of: string };
  totalLabel: string;
  chipPublic: string;
  chipPrivate: string;
  anonymous: string;
  header?: {
    user: string;
    amount: string;
    note: string;
    visibility: string;
    createdAt: string;
  };
}

export interface AdminPaymentsTableProps {
  items: AdminPaymentNoteItem[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  hasFilter: boolean;
  onPageChange: (next: number) => void;
  labels: AdminPaymentsTableLabels;
}

function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

export function AdminPaymentsTable({
  items,
  total,
  page,
  pageSize,
  isLoading,
  hasFilter,
  onPageChange,
  labels,
}: AdminPaymentsTableProps) {
  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center p-5">
        <Spinner />
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <GlassCard
        className={'p-5 items-center'}
        data-testid="admin-payments-empty"
      >
        <span className="opacity-[0.7]">
          {hasFilter ? labels.empty.noResults : labels.empty.noNotes}
        </span>
      </GlassCard>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div
      className="flex flex-col items-stretch gap-3"
      data-testid="admin-payments-table"
    >
      <span className="opacity-[0.7] text-[12px] px-1">
        {labels.totalLabel.replace('{total}', String(total))}
      </span>

      <GlassCard className={'p-0 overflow-hidden'}>
        {labels.header && (
          <div
            className="flex flex-row gap-3 items-center py-2 px-3 bg-[var(--backgroundFocus)] border-b border-[var(--borderColor)]"
            data-testid="admin-payments-header"
          >
            <span className="flex-1 font-bold text-[12px] opacity-[0.85]">
              {labels.header.user}
            </span>
            <span className="w-[120px] text-right font-bold text-[12px] opacity-[0.85]">
              {labels.header.amount}
            </span>
            <span
              className="font-bold text-[12px] opacity-[0.85]"
              style={{ flex: 2 }}
            >
              {labels.header.note}
            </span>
            <span className="w-[88px] font-bold text-[12px] opacity-[0.85]">
              {labels.header.visibility}
            </span>
            <span className="w-[140px] font-bold text-[12px] opacity-[0.85]">
              {labels.header.createdAt}
            </span>
          </div>
        )}

        {items.map((it, i) => (
          <div
            className="flex flex-row gap-3 items-center py-2 px-3 hover:bg-[var(--backgroundHover)] border-b border-[var(--borderColor)]"
            style={{
              backgroundColor:
                i % 2 === 1 ? 'var(--backgroundFocus)' : undefined,
            }}
            key={it.id}
            data-testid={`payment-row-${it.id}`}
          >
            <div className="flex-1 min-w-0">
              <span className="font-bold line-clamp-1">
                {it.displayName ?? labels.anonymous}
              </span>
              <span
                className="opacity-[0.5] text-[12px] line-clamp-1"
                style={{ fontFamily: 'monospace' }}
              >
                {it.transactionId}
              </span>
            </div>
            <span className="w-[120px] text-right font-semibold">
              {formatAmount(it.amount, it.currency)}
            </span>
            <span style={{ flex: 2 }} title={it.note}>
              <span className="">{truncate(it.note, 200)}</span>
            </span>
            <div
              className="w-[88px] px-2 py-1 rounded-lg self-center"
              style={{
                backgroundColor: it.isPublic ? '#11301f' : '#1c1d21',
              }}
              data-testid={`visibility-${it.id}`}
            >
              <span
                className="text-[12px] font-bold text-center"
                style={{
                  color: it.isPublic ? '#3dd68c' : '#6e7683',
                }}
              >
                {it.isPublic ? labels.chipPublic : labels.chipPrivate}
              </span>
            </div>
            <span className="w-[140px] opacity-[0.6] text-[12px]">
              {new Date(it.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </GlassCard>

      <div className="flex flex-row gap-3 items-center justify-center pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          {labels.pagination.prev}
        </Button>
        <span className="opacity-[0.8] text-[14px]">
          {labels.pagination.of
            .replace('{current}', String(page))
            .replace('{total}', String(totalPages))}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          {labels.pagination.next}
        </Button>
      </div>
    </div>
  );
}
