'use client';

import { useMemo, type CSSProperties } from 'react';
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

const FACEDOWN_FAN_OFFSET = 12;
const FACEUP_FAN_OFFSET = 26;

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
      className="w-full rounded-3xl border-2 border-[var(--sol-table-border)] bg-[var(--sol-table-bg)] p-3 sm:p-6 shadow-2xl backdrop-blur-xl select-none transition-colors duration-300"
    >
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className="flex gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onDraw}
            aria-label={
              game.stock.length > 0
                ? t('games.solitaire_v1.board.draw')
                : t('games.solitaire_v1.board.recycle')
            }
            className={cx(
              'relative h-20 w-14 sm:h-28 sm:w-20 rounded-xl border-2 transition-all',
              game.stock.length > 0
                ? 'cursor-pointer border-[var(--sol-card-back-border)]'
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
                  className="absolute inset-0 flex items-center justify-center text-2xl text-[var(--textSecondary)] opacity-60"
                  aria-hidden="true"
                >
                  ↻
                </span>
              )
            )}
          </button>

          <div className="relative h-20 w-14 sm:h-28 sm:w-20 rounded-xl border-2 border-dashed border-[var(--sol-empty-slot-border)] bg-[var(--sol-empty-slot)]">
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
        </div>

        <div className="flex gap-2 sm:gap-3">
          {game.foundations.map((pile, foundationIndex) => {
            const suit = foundationSuitOf(foundationIndex);
            return (
              <button
                key={suit}
                type="button"
                onClick={() => tryMove({ kind: 'foundation', foundationIndex })}
                aria-label={`${t('games.solitaire_v1.board.foundation')} ${SUIT_GLYPHS[suit]}`}
                className="relative h-20 w-14 sm:h-28 sm:w-20 rounded-xl border-2 border-dashed border-[var(--sol-empty-slot-border)] bg-[var(--sol-empty-slot)] transition-colors hover:border-[var(--primary)]"
              >
                {pile.length > 0 ? (
                  <div className="pointer-events-none absolute inset-0">
                    <CardView card={pile[pile.length - 1]} />
                  </div>
                ) : (
                  <span
                    className="flex h-full w-full items-center justify-center text-2xl text-[var(--textSecondary)] opacity-40"
                    aria-hidden="true"
                  >
                    {SUIT_GLYPHS[suit]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1.5 sm:gap-3">
        {game.tableau.map((pile, pileIndex) => (
          <div key={pileIndex} className="relative min-h-24 sm:min-h-32">
            {pile.length === 0 ? (
              <button
                type="button"
                aria-label={`${t('games.solitaire_v1.board.pile')} ${pileIndex + 1}`}
                onClick={() => tryMove({ kind: 'tableau', pileIndex })}
                className="h-20 w-full cursor-pointer rounded-xl border-2 border-dashed border-[var(--sol-empty-slot-border)] bg-[var(--sol-empty-slot)] hover:border-[var(--primary)]"
              />
            ) : (
              <ul className="m-0 flex list-none flex-col p-0">
                {pile.map((card, cardIndex) => {
                  const previous = pile[cardIndex - 1];
                  const pullUp = previous
                    ? previous.faceUp
                      ? FACEUP_FAN_OFFSET
                      : FACEDOWN_FAN_OFFSET
                    : 0;
                  return (
                    <li
                      key={card.id}
                      className={cx(
                        'w-full relative',
                        pullUp === FACEDOWN_FAN_OFFSET && '-mt-3 sm:-mt-3.5',
                        pullUp === FACEUP_FAN_OFFSET && '-mt-6 sm:-mt-7',
                      )}
                    >
                      <div className="aspect-[68/96] w-full">
                        <CardView
                          card={card}
                          selected={
                            selection?.kind === 'tableau' &&
                            selection.pileIndex === pileIndex &&
                            cardIndex >= selection.cardIndex
                          }
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
          className="mt-4 text-center text-xs text-[var(--primary)] font-semibold"
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
