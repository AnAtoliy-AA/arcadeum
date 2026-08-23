'use client';

import { memo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import { SpadesCardBack } from './SpadesCard';

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
        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm',
        tone === 'muted' &&
          'border-[var(--sCardBorder)] bg-[var(--sSurface)] text-[var(--muted-foreground)]',
        tone === 'danger' &&
          'border-[rgba(220,38,38,0.35)] bg-[rgba(220,38,38,0.12)] text-[var(--heartColor)]',
        tone === 'accent' &&
          'border-[rgba(var(--accentRGB),0.4)] bg-[rgba(var(--accentRGB),0.15)] text-[var(--accent)]',
      )}
    >
      {children}
    </span>
  );
}

interface SeatInfo {
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

interface SeatPanelProps {
  seat: SeatInfo;
  side: SeatSide;
  bidding: boolean;
}

/** Player plaque shown around the table: name, bid/tricks score, card backs, turn glow. */
export const SeatPanel = memo(function SeatPanel({
  seat,
  side,
  bidding,
}: SeatPanelProps) {
  const { t } = useTranslation();
  const horizontal = side === 'left' || side === 'right';
  const backs = Math.min(seat.handCount, 8);

  return (
    <div
      data-testid={`spades-seat-${seat.playerId}`}
      className={cx(
        'relative flex items-center gap-2 rounded-2xl border px-3 py-2 backdrop-blur-sm transition-all duration-300',
        'border-[var(--sCardBorder)] bg-[var(--sSurface)]',
        seat.isTurn &&
          'border-[var(--accent)] shadow-[0_0_18px_-4px_rgba(var(--accentRGB),0.7)]',
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
          'flex min-w-10 flex-col',
          horizontal ? 'items-start' : 'items-center text-center',
        )}
      >
        <span className="max-w-[88px] truncate text-xs font-semibold text-[var(--foreground)]">
          {seat.name}
          {seat.isMe ? ' ★' : ''}
          {seat.isPartner && !seat.isMe ? (
            <span className="ml-1 text-[var(--accent)]">
              ♦{t('games.spades_v1.game.partnerLabel').slice(0, 1)}
            </span>
          ) : null}
        </span>
        <span className="text-[11px] text-[var(--muted-foreground)]">
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
        <div
          className={cx(
            'flex',
            horizontal ? 'flex-col' : '',
            backs > 0 ? '' : 'hidden',
          )}
        >
          {Array.from({ length: backs }).map((_, i) => (
            <SpadesCardBack key={i} index={i} />
          ))}
        </div>
      )}
      {bidding && seat.bid != null && (
        <span className="text-[11px] font-semibold text-[var(--success)]">
          ✓
        </span>
      )}{' '}
    </div>
  );
});
