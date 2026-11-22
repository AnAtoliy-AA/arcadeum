'use client';

import { memo, useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { cx } from '@arcadeum/ui/utils/cx';

interface BidPanelProps {
  myBid: number | null;
  canBid: boolean;
  nilEnabled: boolean;
  onBid: (amount: number) => void;
}

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
      <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-[var(--sCardBorder)] bg-[var(--sSurface)] px-4 py-2.5 backdrop-blur-md">
        <p
          className="text-xs sm:text-sm font-medium text-[var(--muted-foreground)]"
          data-testid="spades-bid-waiting"
        >
          {t('games.spades_v1.game.waitingForOpponent')}
        </p>
      </div>
    );
  }

  const currentVal = selected ?? 1;

  const handleStep = (delta: number) => {
    if (!canBid) return;
    const min = nilEnabled ? 0 : 1;
    const max = 13;
    const next = Math.max(min, Math.min(max, currentVal + delta));
    setSelected(next);
  };

  return (
    <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-[var(--sCardBorder)] bg-[var(--sSurface)] px-3 py-2.5 sm:px-4 sm:py-3 backdrop-blur-md shadow-lg w-full max-w-lg mx-auto">
      <div className="flex w-full items-center justify-between px-1">
        <span className="text-xs font-bold text-[var(--foreground)]">
          {canBid ? t('games.spades_v1.game.selectBid') : ''}
        </span>
        <span className="text-xs font-semibold text-[var(--accent)]">
          {selected != null
            ? selected === 0
              ? t('games.spades_v1.game.nilBid')
              : `${selected} ${t('games.spades_v1.game.bidsLabel')}`
            : ''}
        </span>
      </div>

      <div className="flex w-full items-center justify-center gap-2">
        <button
          type="button"
          aria-label="Decrease bid"
          disabled={
            !canBid || (selected != null && selected <= (nilEnabled ? 0 : 1))
          }
          onClick={() => handleStep(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--sCardBorder)] bg-white/5 text-base font-bold text-[var(--foreground)] hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-30"
        >
          −
        </button>

        <div className="flex flex-1 items-center justify-center gap-1 overflow-x-auto py-1 no-scrollbar">
          {nilEnabled && (
            <button
              type="button"
              data-testid="spades-bid-nil"
              disabled={!canBid}
              onClick={() => setSelected(0)}
              aria-pressed={selected === 0}
              className={cx(
                'h-9 shrink-0 rounded-xl border px-3 text-xs font-black uppercase tracking-wider transition-all',
                selected === 0
                  ? 'border-transparent bg-[var(--accent)] text-white shadow-md'
                  : 'border-[var(--sCardBorder)] bg-white/5 text-[var(--muted-foreground)] hover:border-[var(--accent)]',
                canBid ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
              )}
            >
              {t('games.spades_v1.game.nilBid')}
            </button>
          )}

          {Array.from({ length: 13 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              data-testid={`spades-bid-${n}`}
              disabled={!canBid}
              onClick={() => setSelected(n)}
              aria-pressed={selected === n}
              className={cx(
                'h-9 w-8 sm:w-9 shrink-0 rounded-xl border text-xs sm:text-sm font-bold transition-all',
                selected === n
                  ? 'border-transparent bg-[var(--accent)] text-white shadow-md'
                  : 'border-[var(--sCardBorder)] bg-white/5 text-[var(--foreground)] hover:border-[var(--accent)]',
                canBid ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
              )}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-label="Increase bid"
          disabled={!canBid || (selected != null && selected >= 13)}
          onClick={() => handleStep(1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--sCardBorder)] bg-white/5 text-base font-bold text-[var(--foreground)] hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-30"
        >
          +
        </button>
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
        className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[var(--accent)] to-[rgba(var(--accentRGB),0.8)] px-8 py-2 text-xs sm:text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-98 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t('games.spades_v1.game.confirmBid')}
        {selected != null ? ` (${selected})` : ''}
      </button>
    </div>
  );
});
