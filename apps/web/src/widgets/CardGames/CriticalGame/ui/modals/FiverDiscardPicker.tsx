import React, { useState } from 'react';
import type { GameVariant } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { getCardName, getCardEmoji } from '../../lib/cardUtils';
import { FIVER_COMBO_SIZE } from '../../types';
import type { CriticalCard } from '../../types';
import { Card, CardCorner, CardFrame, GradientScrim } from '../styles';
import { CardImage } from '../styles/card-image';

interface FiverDiscardPickerProps {
  selectedFiverCards: CriticalCard[];
  selectedDiscardCard: CriticalCard | null;
  discardPile: CriticalCard[];
  selfHand: CriticalCard[];
  onSelectDiscardCard: (card: CriticalCard) => void;
  onToggleFiverCard: (card: CriticalCard) => void;
  cardVariant?: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const FiverDiscardPicker: React.FC<FiverDiscardPickerProps> = ({
  selectedFiverCards,
  selectedDiscardCard,
  discardPile,
  selfHand,
  onSelectDiscardCard,
  onToggleFiverCard,
  cardVariant,
  t,
}) => {
  const gameVariant = cardVariant as GameVariant;
  const isCompleteFiver = selectedFiverCards.length === FIVER_COMBO_SIZE;
  const [editingHandCards, setEditingHandCards] = useState(!isCompleteFiver);

  const uniqueHandCards = selfHand.filter(
    (card, index) => selfHand.indexOf(card) === index,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* 5 Played Cards Summary or Hand Selector */}
      {!editingHandCards && isCompleteFiver ? (
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              {t('games.table.modals.eventCombo.fiver')} (5 cards selected)
            </span>
            <button
              type="button"
              onClick={() => setEditingHandCards(true)}
              className="text-xs text-sky-400 hover:text-sky-300 hover:underline cursor-pointer focus:outline-none font-medium"
            >
              Change
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedFiverCards.map((card, idx) => (
              <div
                key={`${card}-${idx}`}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-xs text-white/90"
              >
                <span>{getCardEmoji(card)}</span>
                <span className="line-clamp-1 max-w-[90px]">
                  {getCardName(card, cardVariant || 'adventure')}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span>
              {t('games.table.modals.eventCombo.stashCards', {
                count: FIVER_COMBO_SIZE,
              })}{' '}
              ({selectedFiverCards.length}/{FIVER_COMBO_SIZE})
            </span>
            {isCompleteFiver && (
              <button
                type="button"
                onClick={() => setEditingHandCards(false)}
                className="text-xs text-sky-400 hover:text-sky-300 hover:underline cursor-pointer focus:outline-none font-medium"
              >
                Done
              </button>
            )}
          </div>
          <div
            className="flex flex-wrap items-center justify-center gap-2 p-1 max-h-[220px] overflow-y-auto"
            data-testid="fiver-hand-cards"
          >
            {uniqueHandCards.map((card, idx) => {
              const isSelected = selectedFiverCards.includes(card);
              const canSelect =
                isSelected || selectedFiverCards.length < FIVER_COMBO_SIZE;
              return (
                <button
                  key={`${card}-${idx}`}
                  type="button"
                  onClick={() => canSelect && onToggleFiverCard(card)}
                  data-testid={`fiver-hand-card-${card}`}
                  aria-pressed={isSelected}
                  className={cx(
                    'group relative flex flex-col items-center w-[78px] sm:w-[88px] shrink-0 p-1.5 rounded-xl border-2 transition-all duration-150 text-left',
                    canSelect
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed opacity-40',
                    isSelected
                      ? 'border-amber-400 bg-amber-400/15 scale-105 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                      : 'border-transparent bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 active:scale-95',
                  )}
                >
                  <div className="w-full pointer-events-none">
                    <Card
                      cardType={card}
                      variant={gameVariant}
                      className="w-full cursor-default"
                    >
                      <CardCorner position="tl" variant={cardVariant} />
                      <CardCorner position="tr" variant={cardVariant} />
                      <CardCorner position="bl" variant={cardVariant} />
                      <CardCorner position="br" variant={cardVariant} />
                      <CardFrame variant={cardVariant} />
                      <CardImage variant={cardVariant ?? ''} cardType={card} />
                      <GradientScrim />
                    </Card>
                  </div>
                  <span className="text-[11px] text-center line-clamp-1 mt-1 text-white/90">
                    {getCardName(card, cardVariant || 'adventure')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Discard Pile Selection */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          {t('games.table.modals.eventCombo.pickDiscard')}
        </div>

        {discardPile.length === 0 ? (
          <div className="text-sm text-center py-6 text-white/50 italic">
            No cards in discard pile
          </div>
        ) : (
          <div
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-1 max-h-[260px] overflow-y-auto"
            data-testid="fiver-discard-cards"
          >
            {discardPile.map((card, idx) => {
              const isSelected = selectedDiscardCard === card;
              return (
                <button
                  key={`discard-${card}-${idx}`}
                  type="button"
                  onClick={() => onSelectDiscardCard(card)}
                  data-testid={`discard-card-${idx}`}
                  aria-pressed={isSelected}
                  className={cx(
                    'group relative flex flex-col items-center w-[84px] sm:w-[96px] shrink-0 p-1.5 rounded-xl border-2 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 text-left',
                    isSelected
                      ? 'border-white bg-white/15 scale-105 shadow-[0_0_12px_rgba(255,255,255,0.4)] ring-2 ring-white/50'
                      : 'border-transparent bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 active:scale-95',
                  )}
                >
                  <div className="w-full pointer-events-none">
                    <Card
                      cardType={card}
                      variant={gameVariant}
                      className="w-full cursor-default"
                    >
                      <CardCorner position="tl" variant={cardVariant} />
                      <CardCorner position="tr" variant={cardVariant} />
                      <CardCorner position="bl" variant={cardVariant} />
                      <CardCorner position="br" variant={cardVariant} />
                      <CardFrame variant={cardVariant} />
                      <CardImage variant={cardVariant ?? ''} cardType={card} />
                      <GradientScrim />
                    </Card>
                  </div>
                  <span className="text-[11px] sm:text-xs text-center line-clamp-1 mt-1 text-white/90">
                    {getCardName(card, cardVariant || 'adventure')}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
