'use client';

import { cx } from '@arcadeum/ui/utils/cx';
import { cardColor, cardLabel } from '../lib/engine';
import type { Card, Suit } from '../types';

const SUIT_GLYPHS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

interface CardViewProps {
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
}

export function CardView({
  card,
  selected = false,
  onClick,
  onDoubleClick,
  className,
}: CardViewProps) {
  if (!card.faceUp) {
    const faceDownContent = (
      <div
        className={cx(
          'relative h-full w-full rounded-xl border border-[var(--sol-card-back-border,rgba(255,255,255,0.25))] bg-[var(--sol-card-back,linear-gradient(135deg,#312e81_0%,#1e1b4b_100%))] shadow-sm transition-transform overflow-hidden',
          className,
        )}
      >
        <div className="absolute inset-1 sm:inset-1.5 rounded-lg border border-white/25 flex items-center justify-center bg-white/5">
          <div className="h-3 w-3 sm:h-4 sm:w-4 rotate-45 border border-white/30 bg-white/10" />
        </div>
      </div>
    );

    if (!onClick) {
      return faceDownContent;
    }

    return (
      <button
        type="button"
        onClick={onClick}
        aria-hidden="true"
        className="h-full w-full p-0 border-0 bg-transparent cursor-pointer block"
      >
        {faceDownContent}
      </button>
    );
  }

  const isRed = cardColor(card) === 'red';
  const glyph = SUIT_GLYPHS[card.suit];
  const label = cardLabel(card);

  const cardContent = (
    <div
      className={cx(
        'relative flex h-full w-full select-none items-center justify-center rounded-xl border border-slate-200/90 dark:border-slate-300/40 bg-gradient-to-br from-white to-slate-50 font-bold shadow-sm transition-all',
        isRed ? 'text-rose-600' : 'text-slate-900',
        onClick && 'hover:-translate-y-0.5 hover:shadow-md',
        selected &&
          '-translate-y-1.5 ring-2 ring-[var(--sol-selected-ring,#f59e0b)] shadow-lg shadow-amber-400/30',
        className,
      )}
    >
      <div className="absolute left-1 sm:left-1.5 top-1 sm:top-1.5 flex flex-col items-center leading-none">
        <span className="text-xs sm:text-sm font-black tracking-tight">
          {label}
        </span>
        <span className="text-[10px] sm:text-xs mt-0.5" aria-hidden="true">
          {glyph}
        </span>
      </div>

      <span
        className="text-xl sm:text-2xl opacity-75 select-none"
        aria-hidden="true"
      >
        {glyph}
      </span>

      <div className="absolute right-1 sm:right-1.5 bottom-1 sm:bottom-1.5 flex flex-col items-center leading-none rotate-180">
        <span className="text-xs sm:text-sm font-black tracking-tight">
          {label}
        </span>
        <span className="text-[10px] sm:text-xs mt-0.5" aria-hidden="true">
          {glyph}
        </span>
      </div>
    </div>
  );

  if (!onClick && !onDoubleClick) {
    return cardContent;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      aria-label={`${label} ${card.suit}`}
      className="h-full w-full p-0 border-0 bg-transparent cursor-pointer block"
    >
      {cardContent}
    </button>
  );
}
