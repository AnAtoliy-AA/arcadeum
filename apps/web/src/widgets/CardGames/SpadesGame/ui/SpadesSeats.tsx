'use client';

import { memo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/i18n/useTranslation';

export type SeatSide = 'bottom' | 'left' | 'top' | 'right';

export function Chip({
  children,
  tone = 'muted',
}: {
  children: React.ReactNode;
  tone?: 'muted' | 'danger' | 'accent';
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-md shadow-sm',
        tone === 'muted' &&
          'border-[var(--sCardBorder)] bg-[var(--sSurface)] text-[var(--muted-foreground)]',
        tone === 'danger' &&
          'border-[rgba(220,38,38,0.4)] bg-[rgba(220,38,38,0.15)] text-[var(--heartColor)]',
        tone === 'accent' &&
          'border-[rgba(var(--accentRGB),0.4)] bg-[rgba(var(--accentRGB),0.2)] text-[var(--accent)]',
      )}
    >
      {children}
    </span>
  );
}

export interface SeatInfo {
  playerId: string;
  name: string;
  score: number;
  bid: number | null;
  tricksWon: number;
  handCount: number;
  isTurn: boolean;
  isPartner: boolean;
  isMe: boolean;
}

export interface SeatPanelProps {
  seat: SeatInfo;
  side: SeatSide;
  bidding: boolean;
}

export const SeatPanel = memo(function SeatPanel({
  seat,
  side,
  bidding,
}: SeatPanelProps) {
  const { t } = useTranslation();
  const horizontal = side === 'left' || side === 'right';
  const initial = seat.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div
      data-testid={`spades-seat-${seat.playerId}`}
      className={cx(
        'relative flex items-center gap-2 rounded-xl sm:rounded-2xl border px-2.5 py-1.5 sm:px-3 sm:py-2 backdrop-blur-md transition-all duration-300 shadow-md',
        'border-[var(--sCardBorder)] bg-[var(--sSurface)]',
        seat.isTurn
          ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/60 shadow-[0_0_18px_-2px_rgba(var(--accentRGB),0.75)]'
          : null,
      )}
    >
      {seat.isTurn && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 h-2.5 w-2.5 animate-ping rounded-full bg-[var(--accent)]"
        />
      )}

      <div
        className={cx(
          'flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border text-xs font-black shadow-inner',
          seat.isPartner && !seat.isMe
            ? 'border-[var(--accent)] bg-[var(--accent)]/30 text-[var(--accent)]'
            : 'border-white/20 bg-gradient-to-br from-white/20 to-black/30 text-white',
        )}
      >
        {initial}
      </div>

      <div
        className={cx(
          'flex min-w-0 flex-col',
          horizontal ? 'items-start' : 'items-center text-center',
        )}
      >
        <span className="max-w-[70px] sm:max-w-[90px] truncate text-[11px] sm:text-xs font-bold text-white/95 leading-tight flex items-center gap-1">
          {seat.name}
          {seat.isMe ? ' ★' : ''}
          {seat.isPartner && !seat.isMe ? (
            <span className="rounded bg-[var(--accent)]/25 px-1 text-[9px] font-black text-[var(--accent)] uppercase">
              {t('games.spades_v1.game.partnerLabel').slice(0, 1)}
            </span>
          ) : null}
        </span>
        <span className="text-[10px] sm:text-[11px] font-semibold text-[var(--muted-foreground)] leading-tight">
          {seat.score}
          {seat.bid != null ? (
            <span className="ml-1 text-[var(--accent)]">
              ·{' '}
              {seat.bid === 0
                ? t('games.spades_v1.game.bidNil')
                : `${seat.bid}/${seat.tricksWon}`}
            </span>
          ) : null}
        </span>
      </div>

      {!seat.isMe && (
        <div className="flex items-center gap-1 rounded-md border border-[var(--sCardBorder)] bg-black/40 px-1.5 py-0.5 text-[10px] font-bold text-white/90 shadow-sm">
          <span className="text-[10px] opacity-75">🎴</span>
          <span>{seat.handCount}</span>
        </div>
      )}

      {bidding && seat.bid != null && (
        <span className="rounded-full border border-[var(--success)]/50 bg-[var(--success)]/25 px-1.5 py-0.5 text-[10px] font-bold text-[var(--success)]">
          ✓
        </span>
      )}
    </div>
  );
});
