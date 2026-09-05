'use client';

import { useMemo, type CSSProperties } from 'react';
import Image from 'next/image';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import { getSourceCards, isValidMove } from '../lib/engine';
import { useSolitaireTheme } from '../lib/SolitaireThemeContext';
import type { SolitaireTheme } from '../lib/theme';
import type {
  Card,
  MoveSource,
  MoveTarget,
  SolitaireState,
  Suit,
} from '../types';
import { CardView } from './CardView';

interface SolitaireBoardProps {
  game: SolitaireState;
  selection: MoveSource | null;
  onSelect: (source: MoveSource | null) => void;
  onDraw: () => void;
  onMove: (source: MoveSource, target: MoveTarget) => void;
}

const SUIT_GLYPHS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

function boardVars(theme: SolitaireTheme): CSSProperties {
  return {
    '--sol-table-bg': theme.tableBackground,
    '--sol-table-border': theme.tableBorder,
    '--sol-empty-slot': theme.emptySlot,
    '--sol-empty-slot-border': theme.emptySlotBorder,
    '--sol-selected-ring': theme.selectedRing,
    '--sol-card-back': theme.cardBack,
    '--sol-card-back-border': theme.cardBackBorder,
  } as CSSProperties;
}

export function SolitaireBoard({
  game,
  selection,
  onSelect,
  onDraw,
  onMove,
}: SolitaireBoardProps) {
  const { t } = useTranslation();
  const theme = useSolitaireTheme();

  const selectedCards = useMemo(
    () => (selection ? getSourceCards(game, selection) : []),
    [game, selection],
  );

  const tryMove = (target: MoveTarget) => {
    if (!selection) return;
    if (isValidMove(game, selection, target)) {
      onMove(selection, target);
    }
    onSelect(null);
  };

  const tryAutoFoundation = (card: Card) => {
    const source = findCardSource(game, card);
    for (let index = 0; index < game.foundations.length; index += 1) {
      const target = { kind: 'foundation' as const, foundationIndex: index };
      if (isValidMove(game, source, target)) {
        onMove(source, target);
        onSelect(null);
        return;
      }
    }
  };

  const isSameSelection = (a: MoveSource | null, b: MoveSource): boolean => {
    if (!a) return false;
    if (a.kind !== b.kind) return false;
    switch (b.kind) {
      case 'waste':
        return true;
      case 'foundation':
        return (
          a.kind === 'foundation' && a.foundationIndex === b.foundationIndex
        );
      case 'tableau':
        return (
          a.kind === 'tableau' &&
          a.pileIndex === b.pileIndex &&
          a.cardIndex === b.cardIndex
        );
      default:
        return false;
    }
  };

  const toggleSelect = (source: MoveSource) => {
    onSelect(isSameSelection(selection, source) ? null : source);
  };

  const handleTableauClick = (pileIndex: number, cardIndex: number | null) => {
    if (
      selection &&
      !(
        selection.kind === 'tableau' &&
        selection.pileIndex === pileIndex &&
        (cardIndex === null || selection.cardIndex === cardIndex)
      )
    ) {
      const target = { kind: 'tableau' as const, pileIndex };
      if (isValidMove(game, selection, target)) {
        onMove(selection, target);
      }
      onSelect(null);
      return;
    }
    if (cardIndex === null) {
      onSelect(null);
      return;
    }
    toggleSelect({ kind: 'tableau', pileIndex, cardIndex });
  };

  return (
    <div
      style={boardVars(theme)}
      className="relative w-full rounded-2xl sm:rounded-3xl border border-[var(--sol-table-border)] bg-[var(--sol-table-bg)] p-1.5 sm:p-4 shadow-xl select-none transition-colors duration-200 overflow-hidden"
    >
      {theme.bgImage && (
        <Image
          src={theme.bgImage}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 880px"
          aria-hidden="true"
          className="pointer-events-none object-cover object-center opacity-10"
        />
      )}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-3 items-start">
        <button
          type="button"
          onClick={onDraw}
          aria-label={
            game.stock.length > 0
              ? t('games.solitaire_v1.board.draw')
              : t('games.solitaire_v1.board.recycle')
          }
          className={cx(
            'relative aspect-[68/96] w-full rounded-xl border-2 transition-all block',
            game.stock.length > 0
              ? 'cursor-pointer border-[var(--sol-card-back-border)] shadow-md hover:-translate-y-0.5'
              : 'cursor-pointer border-dashed border-[var(--sol-empty-slot-border)] bg-[var(--sol-empty-slot)] hover:border-[var(--primary)]',
          )}
        >
          {game.stock.length > 0 ? (
            <div className="absolute inset-0">
              <CardView
                card={{
                  ...game.stock[game.stock.length - 1],
                  faceUp: false,
                }}
              />
            </div>
          ) : (
            game.waste.length > 0 && (
              <span
                className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl text-[var(--textSecondary)] opacity-60 transition-transform hover:rotate-45"
                aria-hidden="true"
              >
                ↻
              </span>
            )
          )}
        </button>

        <div className="relative aspect-[68/96] w-full rounded-xl border-2 border-dashed border-[var(--sol-empty-slot-border)] bg-[var(--sol-empty-slot)]">
          {game.waste.length > 0 && (
            <div className="absolute inset-0">
              <CardView
                card={game.waste[game.waste.length - 1]}
                selected={isSameSelection(selection, { kind: 'waste' })}
                onClick={() => toggleSelect({ kind: 'waste' })}
                onDoubleClick={() =>
                  tryAutoFoundation(game.waste[game.waste.length - 1])
                }
              />
            </div>
          )}
        </div>

        <div
          className="aspect-[68/96] w-full pointer-events-none"
          aria-hidden="true"
        />

        {game.foundations.map((pile, foundationIndex) => {
          const suit = foundationSuitOf(foundationIndex);
          return (
            <button
              key={suit}
              type="button"
              onClick={() => tryMove({ kind: 'foundation', foundationIndex })}
              aria-label={`${t('games.solitaire_v1.board.foundation')} ${SUIT_GLYPHS[suit]}`}
              className="relative aspect-[68/96] w-full rounded-xl border-2 border-dashed border-[var(--sol-empty-slot-border)] bg-[var(--sol-empty-slot)] transition-colors hover:border-[var(--primary)] block"
            >
              {pile.length > 0 ? (
                <div className="pointer-events-none absolute inset-0">
                  <CardView card={pile[pile.length - 1]} />
                </div>
              ) : (
                <span
                  className="flex h-full w-full items-center justify-center text-lg sm:text-2xl text-[var(--textSecondary)] opacity-40 select-none"
                  aria-hidden="true"
                >
                  {SUIT_GLYPHS[suit]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 sm:mt-4 grid grid-cols-7 gap-1.5 sm:gap-3 items-start">
        {game.tableau.map((pile, pileIndex) => (
          <div key={pileIndex} className="relative">
            {pile.length === 0 ? (
              <button
                type="button"
                aria-label={`${t('games.solitaire_v1.board.pile')} ${pileIndex + 1}`}
                onClick={() => tryMove({ kind: 'tableau', pileIndex })}
                className="aspect-[68/96] w-full cursor-pointer rounded-xl border-2 border-dashed border-[var(--sol-empty-slot-border)] bg-[var(--sol-empty-slot)] hover:border-[var(--primary)] block"
              />
            ) : (
              <ul className="m-0 flex list-none flex-col p-0">
                {pile.map((card, cardIndex) => {
                  const previous = pile[cardIndex - 1];
                  const isSelected =
                    selection?.kind === 'tableau' &&
                    selection.pileIndex === pileIndex &&
                    cardIndex >= selection.cardIndex;
                  return (
                    <li
                      key={card.id}
                      data-fan={
                        cardIndex > 0
                          ? previous?.faceUp
                            ? 'faceup'
                            : 'facedown'
                          : undefined
                      }
                      className={cx(
                        'w-full relative',
                        cardIndex > 0 &&
                          (previous?.faceUp
                            ? 'mt-[calc(-141.18%+1.5rem)] sm:mt-[calc(-141.18%+1.625rem)]'
                            : 'mt-[calc(-141.18%+0.75rem)] sm:mt-[calc(-141.18%+0.875rem)]'),
                        isSelected ? 'z-20' : 'z-0',
                      )}
                    >
                      <div className="aspect-[68/96] w-full">
                        <CardView
                          card={card}
                          selected={isSelected}
                          onClick={
                            card.faceUp
                              ? () => handleTableauClick(pileIndex, cardIndex)
                              : () => handleTableauClick(pileIndex, null)
                          }
                          onDoubleClick={
                            card.faceUp && cardIndex === pile.length - 1
                              ? () => tryAutoFoundation(card)
                              : undefined
                          }
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>

      {selectedCards.length > 0 && (
        <p
          className="mt-2.5 text-center text-xs text-[var(--primary)] font-semibold"
          role="status"
        >
          {t('games.solitaire_v1.board.selectedHint')}
        </p>
      )}
    </div>
  );
}

function foundationSuitOf(index: number): Suit {
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  return suits[index] ?? 'spades';
}

function findCardSource(game: SolitaireState, card: Card): MoveSource {
  if (game.waste[game.waste.length - 1]?.id === card.id) {
    return { kind: 'waste' };
  }
  for (let f = 0; f < game.foundations.length; f += 1) {
    const last = game.foundations[f][game.foundations[f].length - 1];
    if (last?.id === card.id) return { kind: 'foundation', foundationIndex: f };
  }
  for (let p = 0; p < game.tableau.length; p += 1) {
    const idx = game.tableau[p].findIndex((c) => c.id === card.id);
    if (idx >= 0) return { kind: 'tableau', pileIndex: p, cardIndex: idx };
  }
  return { kind: 'waste' };
}
