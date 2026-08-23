'use client';

import { memo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';

const SUIT_SYMBOLS: Record<string, string> = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣',
};

/** Rank symbol → i18n key under `games.spades_v1.card.ranks`. */
const RANK_KEYS: Record<string, string> = {
  '2': 'two',
  '3': 'three',
  '4': 'four',
  '5': 'five',
  '6': 'six',
  '7': 'seven',
  '8': 'eight',
  '9': 'nine',
  '10': 'ten',
  J: 'jack',
  Q: 'queen',
  K: 'king',
  A: 'ace',
};

/** Suit symbol → i18n key under `games.spades_v1.card.suits`. */
const SUIT_KEYS: Record<string, string> = {
  S: 'spades',
  H: 'hearts',
  D: 'diamonds',
  C: 'clubs',
};

type CardSize = 'sm' | 'md';

interface SpadesCardProps {
  cardId: string;
  size?: CardSize;
  playable?: boolean;
  onClick?: () => void;
}

function parseCard(cardId: string): { rank: string; suit: string } {
  return { rank: cardId.slice(0, -1), suit: cardId.slice(-1) };
}

export const SpadesCard = memo(function SpadesCard({
  cardId,
  size = 'md',
  playable = false,
  onClick,
}: SpadesCardProps) {
  const { t } = useTranslation();
  const { rank, suit } = parseCard(cardId);
  const symbol = SUIT_SYMBOLS[suit] ?? '?';
  const isRed = suit === 'H' || suit === 'D';
  const interactive = Boolean(onClick);

  const rankName = RANK_KEYS[rank]
    ? t(
        `games.spades_v1.card.ranks.${RANK_KEYS[rank]}` as Parameters<
          typeof t
        >[0],
      )
    : rank;
  const suitName = SUIT_KEYS[suit]
    ? t(
        `games.spades_v1.card.suits.${SUIT_KEYS[suit]}` as Parameters<
          typeof t
        >[0],
      )
    : suit;
  const label = t('games.spades_v1.card.name' as TranslationKey, {
    rank: rankName,
    suit: suitName,
  });

  return (
    <button
      type="button"
      data-testid={`spades-card-${cardId}`}
      aria-label={label}
      onClick={onClick}
      disabled={!interactive}
      tabIndex={interactive ? 0 : -1}
      className={cx(
        'group relative flex select-none flex-col items-center justify-center rounded-xl border font-bold shadow-md transition-all duration-200',
        size === 'md' ? 'h-[76px] w-[54px] sm:h-20 sm:w-14' : 'h-14 w-10',
        isRed ? 'text-[var(--heartColor)]' : 'text-[var(--spadeColor)]',
        interactive && playable
          ? 'cursor-pointer border-[var(--sCardBorder)] bg-gradient-to-b from-white to-slate-100 hover:-translate-y-2 hover:shadow-[0_8px_24px_-6px_rgba(var(--accentRGB),0.55)]'
          : null,
        !playable && !interactive ? 'opacity-45 saturate-50' : null,
        !interactive
          ? 'border-[var(--sCardBorder)] bg-[var(--sSurface)]'
          : null,
      )}
    >
      <span
        className={cx(
          'absolute top-1 left-1.5 leading-none',
          size === 'md' ? 'text-xs' : 'text-[9px]',
        )}
      >
        {rank}
      </span>
      <span className={size === 'md' ? 'text-2xl' : 'text-lg leading-none'}>
        {symbol}
      </span>
      <span
        className={cx(
          'absolute right-1.5 bottom-1 rotate-180 leading-none',
          size === 'md' ? 'text-xs' : 'text-[9px]',
        )}
      >
        {rank}
      </span>
    </button>
  );
});

/** Face-down card back used for opponents' hands. */
export const SpadesCardBack = memo(function SpadesCardBack({
  index = 0,
}: {
  index?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="-ml-2 h-11 w-8 rounded-md border border-[var(--sCardBorder)] shadow first:ml-0"
      style={{
        background: `linear-gradient(135deg, rgba(var(--accentRGB),0.35) 0%, var(--sSurface) 55%, rgba(var(--accentRGB),0.25) 100%)`,
        transform: `rotate(${(index % 3) - 1}deg)`,
      }}
    />
  );
});
