'use client';

import { cx } from '@arcadeum/ui/utils/cx';
import { cardColor, cardLabel } from '../lib/engine';
import { useSolitaireTheme } from '../lib/SolitaireThemeContext';
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
  /** Enables pointer affordance; board decides actual click behavior. */
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
  const theme = useSolitaireTheme();

  if (!card.faceUp) {
    return (
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        className={cx(
          'relative h-full w-full rounded-[10px] border shadow-sm',
          'bg-gradient-to-br from-indigo-500 to-sky-400',
          className,
        )}
        style={{ borderColor: theme.cardBackBorder }}
      />
    );
  }

  const color = cardColor(card) === 'red' ? theme.redSuit : theme.blackSuit;

  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      aria-label={`${cardLabel(card)} ${card.suit}`}
      className={cx(
        'relative flex h-full w-full select-none items-center justify-center',
        'rounded-[10px] border bg-white font-bold shadow-sm transition-transform',
        onClick && 'cursor-pointer hover:-translate-y-0.5',
        selected && '-translate-y-1 ring-2 ring-offset-1',
        className,
      )}
      style={{
        color,
        borderColor: theme.cardFaceBorder,
        ...(selected ? { boxShadow: `0 0 0 2px ${theme.selectedRing}` } : {}),
      }}
    >
      <span className="text-sm leading-none sm:text-base">
        {cardLabel(card)}
      </span>
      <span
        className="absolute right-1 top-0.5 text-xs leading-none sm:text-sm"
        aria-hidden="true"
      >
        {SUIT_GLYPHS[card.suit]}
      </span>
      <span
        className="absolute bottom-0.5 left-1 text-xs leading-none sm:text-sm"
        aria-hidden="true"
      >
        {SUIT_GLYPHS[card.suit]}
      </span>
    </button>
  );
}
