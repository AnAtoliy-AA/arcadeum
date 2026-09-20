import { memo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

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
          'border-[var(--hCardBorder)] bg-[var(--hSurface)] text-[var(--muted-foreground)]',
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
  handScore: number;
  handCount: number;
  isTurn: boolean;
  hasPassed: boolean;
  isMe: boolean;
}

export interface SeatPanelProps {
  seat: SeatInfo;
  side: SeatSide;
  passing: boolean;
}

export const SeatPanel = memo(function SeatPanel({
  seat,
  side,
  passing,
}: SeatPanelProps) {
  const horizontal = side === 'left' || side === 'right';
  const initial = seat.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div
      data-testid={`hearts-seat-${seat.playerId}`}
      className={cx(
        'relative flex items-center gap-2 rounded-xl sm:rounded-2xl border px-2.5 py-1.5 sm:px-3 sm:py-2 backdrop-blur-md transition-all duration-300 shadow-md',
        'border-[var(--hCardBorder)] bg-[var(--hSurface)]',
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

      <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-white/20 to-black/30 text-xs font-black text-white shadow-inner">
        {initial}
      </div>

      <div
        className={cx(
          'flex min-w-0 flex-col',
          horizontal ? 'items-start' : 'items-center text-center',
        )}
      >
        <span className="max-w-[70px] sm:max-w-[90px] truncate text-[11px] sm:text-xs font-bold text-white/95 leading-tight">
          {seat.name}
          {seat.isMe ? ' ★' : ''}
        </span>
        <span className="text-[10px] sm:text-[11px] font-semibold text-[var(--muted-foreground)] leading-tight">
          {seat.score}
          {seat.handScore > 0 ? (
            <span className="ml-1 font-bold text-[var(--heartColor)]">
              +{seat.handScore}
            </span>
          ) : null}
        </span>
      </div>

      {!seat.isMe && (
        <div className="flex items-center gap-1 rounded-md border border-[var(--hCardBorder)] bg-black/40 px-1.5 py-0.5 text-[10px] font-bold text-white/90 shadow-sm">
          <span className="text-[10px] opacity-75">🎴</span>
          <span>{seat.handCount}</span>
        </div>
      )}

      {passing && seat.hasPassed && (
        <span className="rounded-full border border-[var(--success)]/50 bg-[var(--success)]/25 px-1.5 py-0.5 text-[10px] font-bold text-[var(--success)]">
          ✓
        </span>
      )}
    </div>
  );
});
