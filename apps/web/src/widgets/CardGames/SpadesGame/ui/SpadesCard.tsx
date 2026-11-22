'use client';

import { memo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';

const SUIT_SYMBOLS: Record<string, string> = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣',
};

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

  const suitColorClass =
    suit === 'H'
      ? 'text-[var(--heartColor)]'
      : suit === 'D'
        ? 'text-[var(--diamondColor)]'
        : suit === 'S'
          ? 'text-[var(--spadeColor)]'
          : 'text-[var(--clubColor)]';

  return (
    <button
      type="button"
      data-testid={`spades-card-${cardId}`}
      aria-label={label}
      onClick={onClick}
      disabled={!interactive || !playable}
      tabIndex={interactive && playable ? 0 : -1}
      className={cx(
        'group relative flex shrink-0 select-none flex-col items-center justify-center rounded-lg sm:rounded-xl border font-bold shadow-md transition-all duration-200',
        'bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-white dark:to-slate-100',
        suitColorClass,
        size === 'md'
          ? 'h-[68px] w-[42px] sm:h-20 sm:w-14'
          : 'h-12 w-9 sm:h-14 sm:w-10',
        interactive && playable
          ? 'cursor-pointer border-slate-300 hover:-translate-y-3.5 hover:shadow-xl hover:ring-2 hover:ring-[var(--accent)] hover:z-30 active:translate-y-0'
          : null,
        interactive && !playable
          ? 'cursor-not-allowed border-slate-300/60 bg-slate-200/90 text-slate-400 opacity-60 saturate-50'
          : null,
        !interactive ? 'border-slate-300 shadow-md cursor-default' : null,
      )}
    >
      <span
        className={cx(
          'absolute top-1 left-1 flex flex-col items-center leading-none pointer-events-none',
          size === 'md' ? 'text-[11px] sm:text-xs' : 'text-[9px]',
        )}
      >
        <span className="font-black tracking-tight">{rank}</span>
        <span
          className={size === 'md' ? 'text-[9px] sm:text-[10px]' : 'text-[7px]'}
        >
          {symbol}
        </span>
      </span>

      <span
        className={cx(
          'leading-none select-none pointer-events-none',
          size === 'md' ? 'text-xl sm:text-2xl' : 'text-sm sm:text-base',
        )}
      >
        {symbol}
      </span>

      <span
        className={cx(
          'absolute bottom-1 right-1 flex flex-col items-center leading-none rotate-180 pointer-events-none',
          size === 'md' ? 'text-[11px] sm:text-xs' : 'text-[9px]',
        )}
      >
        <span className="font-black tracking-tight">{rank}</span>
        <span
          className={size === 'md' ? 'text-[9px] sm:text-[10px]' : 'text-[7px]'}
        >
          {symbol}
        </span>
      </span>
    </button>
  );
});

export const SpadesCardBack = memo(function SpadesCardBack({
  index = 0,
}: {
  index?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        '-ml-2.5 h-10 w-7 shrink-0 rounded-md border border-[var(--sCardBorder)] shadow-md first:ml-0 bg-gradient-to-br from-[var(--sSurface)] via-[rgba(var(--accentRGB),0.3)] to-[rgba(var(--accentRGB),0.15)] flex items-center justify-center backdrop-blur-sm sm:h-11 sm:w-8',
        index % 2 === 0 ? 'rotate-1' : '-rotate-1',
      )}
    >
      <span className="text-[10px] text-[var(--accent)] opacity-40">♠</span>
    </div>
  );
});
