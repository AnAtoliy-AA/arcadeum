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
          'relative h-full w-full rounded-xl border border-indigo-400/40 bg-gradient-to-br from-indigo-800 via-indigo-900 to-slate-950 shadow-md',
          className,
        )}
      >
        <div className="absolute inset-1 rounded-lg border border-dashed border-indigo-400/30" />
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
        className="h-full w-full p-0 border-0 bg-transparent cursor-pointer"
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
        'relative flex h-full w-full select-none items-center justify-center rounded-xl border border-slate-200 bg-white font-bold shadow-md transition-all',
        isRed ? 'text-rose-600' : 'text-slate-900',
        onClick && 'hover:-translate-y-0.5 hover:shadow-lg',
        selected &&
          '-translate-y-2 ring-2 ring-amber-400 shadow-lg shadow-amber-400/30',
        className,
      )}
    >
      <div className="absolute left-1 top-1 flex flex-col items-center leading-none">
        <span className="text-xs sm:text-sm font-extrabold">{label}</span>
        <span className="text-[10px] sm:text-xs" aria-hidden="true">
          {glyph}
        </span>
      </div>

      <span
        className="text-xl sm:text-2xl opacity-80 select-none"
        aria-hidden="true"
      >
        {glyph}
      </span>

      <div className="absolute right-1 bottom-1 flex flex-col items-center leading-none rotate-180">
        <span className="text-xs sm:text-sm font-extrabold">{label}</span>
        <span className="text-[10px] sm:text-xs" aria-hidden="true">
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
      className="h-full w-full p-0 border-0 bg-transparent cursor-pointer"
    >
      {cardContent}
    </button>
  );
}
