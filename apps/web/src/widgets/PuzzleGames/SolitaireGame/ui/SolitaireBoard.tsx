'use client';

import { useMemo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  getSourceCards,
  isValidMove,
} from '../lib/engine';
import { useSolitaireTheme } from '../lib/SolitaireThemeContext';
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
  /** Currently grabbed source, if any. */
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

/** Vertical offset between consecutive face-down / face-up cards in a fan. */
const FACEDOWN_FAN_OFFSET = 10;
const FACEUP_FAN_OFFSET = 24;

export function SolitaireBoard({
  game,
  selection,
  onSelect,
  onDraw,
  onMove,
}: SolitaireBoardProps) {
  const theme = useSolitaireTheme();
  const { t } = useTranslation();

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
    // A pending selection aimed at this column becomes a move attempt;
    // otherwise the click toggles card selection within the column.
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

  const slotStyle = {
    background: theme.emptySlot,
    borderColor: theme.emptySlotBorder,
  } as const;

  return (
    <div
      className="rounded-2xl border p-3 [--card-h:72px] [--card-w:52px] sm:p-5 sm:[--card-h:96px] sm:[--card-w:68px]"
      style={{
        background: theme.tableBackground,
        borderColor: theme.tableBorder,
      }}
    >
      {/* Top row: stock + waste on the left, foundations on the right */}
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
              'relative h-[var(--card-h)] w-[var(--card-w)] rounded-[10px] border',
              game.stock.length > 0 || game.waste.length > 0
                ? 'cursor-pointer'
                : 'cursor-default',
            )}
            style={slotStyle}
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
                  className="absolute inset-0 flex items-center justify-center text-xl opacity-40"
                  aria-hidden="true"
                >
                  ↻
                </span>
              )
            )}
          </button>

          <div
            className="relative h-[var(--card-h)] w-[var(--card-w)] rounded-[10px] border"
            style={slotStyle}
          >
            {game.waste.length > 0 && (
              <div className="absolute inset-0">
                <CardView
                  card={game.waste[game.waste.length - 1]}
                  selected={isSameSelection(selection, { kind: 'waste' })}
                  onClick={() =>
                    toggleSelect({ kind: 'waste' })
                  }
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
                onClick={() =>
                  tryMove({ kind: 'foundation', foundationIndex })
                }
                aria-label={`${t('games.solitaire_v1.board.foundation')} ${SUIT_GLYPHS[suit]}`}
                className="relative h-[var(--card-h)] w-[var(--card-w)] rounded-[10px] border"
                style={slotStyle}
              >
                {pile.length > 0 ? (
                  <div className="pointer-events-none absolute inset-0">
                    <CardView card={pile[pile.length - 1]} />
                  </div>
                ) : (
                  <span
                    className="flex h-full w-full items-center justify-center text-xl opacity-30"
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

      {/* Tableau: seven columns, natural flow with overlapping fans */}
      <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-3">
        {game.tableau.map((pile, pileIndex) => (
          <div key={pileIndex} className="relative">
            {pile.length === 0 ? (
              <button
                type="button"
                aria-label={`${t('games.solitaire_v1.board.pile')} ${pileIndex + 1}`}
                onClick={() => tryMove({ kind: 'tableau', pileIndex })}
                className="h-[var(--card-h)] w-full cursor-pointer rounded-[10px] border"
                style={slotStyle}
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
                      className="w-full"
                      style={{
                        marginTop: pullUp > 0 ? -pullUp : undefined,
                        zIndex: cardIndex,
                        position: 'relative',
                      }}
                    >
                      <div className="aspect-[68/96]">
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
        <p className="mt-3 text-center text-xs opacity-70" role="status">
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

/** Locates which pile currently holds `card` and returns its move source. */
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
