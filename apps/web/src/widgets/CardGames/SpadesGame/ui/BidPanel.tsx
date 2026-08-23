'use client';

import { memo, useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { cx } from '@arcadeum/ui/utils/cx';

interface BidPanelProps {
  /** Bids already placed this hand (all players, keyed by player id). */
  myBid: number | null;
  canBid: boolean;
  nilEnabled: boolean;
  onBid: (amount: number) => void;
}

/**
 * Bid selector: chips 1..13 plus a Nil chip. Local selection state, one
 * explicit confirm so misclicks don't commit a contract.
 */
export const BidPanel = memo(function BidPanel({
  myBid,
  canBid,
  nilEnabled,
  onBid,
}: BidPanelProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number | null>(null);

  if (myBid != null) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--sCardBorder)] bg-[var(--sSurface)] px-4 py-3">
        <p
          className="text-sm text-[var(--muted-foreground)]"
          data-testid="spades-bid-waiting"
        >
          {t('games.spades_v1.game.waitingForOpponent')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--sCardBorder)] bg-[var(--sSurface)] px-4 py-3">
      <p className="text-sm text-[var(--muted-foreground)]">
        {canBid ? t('games.spades_v1.game.selectBid') : ''}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {Array.from({ length: 13 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            data-testid={`spades-bid-${n}`}
            disabled={!canBid}
            onClick={() => setSelected(n)}
            aria-pressed={selected === n}
            className={cx(
              'h-9 w-9 rounded-lg border text-sm font-semibold transition-all',
              selected === n
                ? 'border-transparent text-white shadow-md'
                : 'border-[var(--sCardBorder)] bg-transparent text-[var(--foreground)]',
              !selected && 'hover:border-[var(--accent)]',
              canBid ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
            )}
            style={selected === n ? { background: 'var(--accent)' } : undefined}
          >
            {n}
          </button>
        ))}
        {nilEnabled && (
          <button
            type="button"
            data-testid="spades-bid-nil"
            disabled={!canBid}
            onClick={() => setSelected(0)}
            aria-pressed={selected === 0}
            className={cx(
              'h-9 rounded-full border px-4 text-xs font-bold uppercase tracking-wide transition-all',
              selected === 0
                ? 'border-transparent text-white shadow-md'
                : 'border-dashed border-[var(--sCardBorder)] bg-transparent text-[var(--muted-foreground)]',
              canBid ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
            )}
            style={selected === 0 ? { background: 'var(--accent)' } : undefined}
          >
            {t('games.spades_v1.game.nilBid')}
          </button>
        )}
      </div>
      <button
        type="button"
        data-testid="spades-confirm-bid"
        disabled={!canBid || selected == null}
        onClick={() => {
          if (selected != null) {
            onBid(selected);
            setSelected(null);
          }
        }}
        className="rounded-xl bg-gradient-to-r from-[var(--accent)] to-[rgba(var(--accentRGB),0.75)] px-6 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t('games.spades_v1.game.confirmBid')}
      </button>
    </div>
  );
});
