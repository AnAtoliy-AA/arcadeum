'use client';

import { useRef, useEffect } from 'react';
import { Button, GlassCard, Spinner, Typography } from '@arcadeum/ui';
import type { AdminPaymentNoteItem } from '../api';

export interface AdminPaymentsTableLabels {
  empty: { noNotes: string; noResults: string };
  pagination?: { prev: string; next: string; of: string };
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
  isLoading: boolean;
  hasFilter: boolean;
  onLoadMore?: () => void;
  page?: number;
  pageSize?: number;
  onPageChange?: (next: number) => void;
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
  isLoading,
  hasFilter,
  onLoadMore,
  labels,
}: AdminPaymentsTableProps) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const hasMore = items.length < total;

  useEffect(() => {
    const target = observerTarget.current;
    if (
      !target ||
      !hasMore ||
      isLoading ||
      !onLoadMore ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' },
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [hasMore, isLoading, onLoadMore]);

  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <GlassCard
        className="p-8 items-center justify-center border border-[var(--borderColor)]"
        data-testid="admin-payments-empty"
      >
        <Typography variant="body" uiSize="md" alpha="medium">
          {hasFilter ? labels.empty.noResults : labels.empty.noNotes}
        </Typography>
      </GlassCard>
    );
  }

  return (
    <div
      className="flex flex-col items-stretch gap-4"
      data-testid="admin-payments-table"
    >
      <div className="flex flex-row items-center justify-between px-1">
        <Typography variant="heading" uiSize="sm" weight="700">
          Showing {items.length} of {total} notes
        </Typography>
      </div>

      <GlassCard className="p-0 overflow-hidden border border-[var(--borderColor)]">
        {labels.header && (
          <div
            className="flex flex-row gap-3 items-center py-2.5 px-3 bg-[var(--backgroundFocus)] border-b border-[var(--borderColor)]"
            data-testid="admin-payments-header"
          >
            <span className="flex-1 font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
              {labels.header.user}
            </span>
            <span className="w-[120px] text-right font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
              {labels.header.amount}
            </span>
            <span className="flex-[2] font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
              {labels.header.note}
            </span>
            <span className="w-[88px] font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
              {labels.header.visibility}
            </span>
            <span className="w-[140px] font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
              {labels.header.createdAt}
            </span>
          </div>
        )}

        <div className="divide-y divide-[var(--borderColor)]">
          {items.map((it, i) => (
            <div
              className={`flex flex-row gap-3 items-center py-3 px-3 hover:bg-[rgba(255,255,255,0.03)] transition-colors ${
                i % 2 === 1 ? 'bg-[var(--backgroundFocus)]' : ''
              }`}
              key={it.id}
              data-testid={`payment-row-${it.id}`}
            >
              <div className="flex-1 min-w-0">
                <span className="font-bold text-sm text-[var(--colorText)] line-clamp-1 block">
                  {it.displayName ?? labels.anonymous}
                </span>
                <span className="opacity-50 text-xs font-mono line-clamp-1 block text-[var(--colorTextSecondary,#a1a1aa)]">
                  {it.transactionId}
                </span>
              </div>
              <span className="w-[120px] text-right font-semibold font-mono text-sm text-[var(--colorText)]">
                {formatAmount(it.amount, it.currency)}
              </span>
              <span
                className="flex-[2] text-sm text-[var(--colorTextSecondary,#d4d4d8)]"
                title={it.note}
              >
                {truncate(it.note, 200)}
              </span>
              <div
                className={`w-[88px] px-2 py-1 rounded-lg text-center ${
                  it.isPublic
                    ? 'bg-emerald-950/40 border border-emerald-500/20 text-emerald-400'
                    : 'bg-zinc-800/40 border border-zinc-500/20 text-zinc-400'
                }`}
                data-testid={`visibility-${it.id}`}
              >
                <span className="text-xs font-bold">
                  {it.isPublic ? labels.chipPublic : labels.chipPrivate}
                </span>
              </div>
              <span className="w-[140px] text-xs text-[var(--colorTextSecondary,#a1a1aa)]">
                {new Date(it.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {hasMore ? (
        <div
          ref={observerTarget}
          className="flex flex-col items-center justify-center p-4 gap-3"
          data-testid="admin-payments-infinite-scroll-trigger"
        >
          {isLoading && <Spinner size="sm" />}
          {onLoadMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              data-testid="admin-payments-load-more"
            >
              Load more
            </Button>
          )}
        </div>
      ) : (
        <div
          className="flex flex-row items-center justify-center py-4 text-center"
          data-testid="admin-payments-all-loaded"
        >
          <Typography variant="caption" alpha="low">
            All {total} notes loaded
          </Typography>
        </div>
      )}
    </div>
  );
}
