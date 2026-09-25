import React from 'react';
import type { GameVariant } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { getCardName } from '../../lib/cardUtils';
import { ALL_GAME_CARDS } from '../../types';
import type { CriticalCard } from '../../types';
import { Card, CardCorner, CardFrame, GradientScrim } from '../styles';
import { CardImage } from '../styles/card-image';

interface TrioCardPickerProps {
  selectedCard: CriticalCard | null;
  onSelectCard: (card: CriticalCard) => void;
  cardVariant?: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const TrioCardPicker: React.FC<TrioCardPickerProps> = ({
  selectedCard,
  onSelectCard,
  cardVariant,
  t,
}) => {
  const gameVariant = cardVariant as GameVariant;
  const cards = ALL_GAME_CARDS.filter((c) => c !== 'critical_event');

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
        {t('games.table.modals.eventCombo.selectCard')}
      </div>

      <div
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-1 max-h-[320px] overflow-y-auto"
        data-testid="trio-card-picker"
      >
        {cards.map((card) => {
          const isSelected = selectedCard === card;
          return (
            <button
              key={card}
              type="button"
              onClick={() => onSelectCard(card as CriticalCard)}
              data-testid={`trio-card-${card}`}
              aria-pressed={isSelected}
              className={cx(
                'group relative flex flex-col items-center w-[84px] sm:w-[96px] shrink-0 p-1.5 rounded-xl border-2 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 text-left',
                isSelected
                  ? 'border-white bg-white/15 scale-105 shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                  : 'border-transparent bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 active:scale-95',
              )}
            >
              <div className="w-full pointer-events-none">
                <Card
                  cardType={card as CriticalCard}
                  variant={gameVariant}
                  className="w-full cursor-default"
                >
                  <CardCorner position="tl" variant={cardVariant} />
                  <CardCorner position="tr" variant={cardVariant} />
                  <CardCorner position="bl" variant={cardVariant} />
                  <CardCorner position="br" variant={cardVariant} />
                  <CardFrame variant={cardVariant} />
                  <CardImage
                    variant={cardVariant ?? ''}
                    cardType={card as string}
                  />
                  <GradientScrim />
                </Card>
              </div>
              <span className="text-[11px] sm:text-xs text-center line-clamp-1 mt-1 text-white/90">
                {getCardName(card as CriticalCard, cardVariant || 'adventure')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
