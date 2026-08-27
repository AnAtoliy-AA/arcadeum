'use client';

import { useMemo, type CSSProperties } from 'react';
import { HandCard } from './HandCard';
import type { HandCardInstance } from '../../lib/combo';

interface HandCardsProps {
  cards: HandCardInstance[];
  selectedUids: string[];
  onToggleSelect: (uid: string) => void;
  cardVariant?: string;
  disabled?: boolean;
  showName?: boolean;
  showDescription?: boolean;
  /**
   * Apply per-card fan rotation around the centre of the row. Defaults to
   * `true` for the desktop layout; the mobile bar disables it because
   * cards already scroll horizontally and rotation eats horizontal space.
   */
  isFanned?: boolean;
  /** Fired on double-click / double-tap on a card to play it directly. */
  onDoubleClick?: (uid: string) => void;
}

const EDGE_FADE_MASK =
  'linear-gradient(90deg, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%)';

/**
 * Horizontal card track for the player's hand. Each cell is a `HandCard`
 * — selection state lives one level up in `MatchWidget` so the arena's
 * `ComboCard` can read it too. Desktop: single-row nowrap with horizontal
 * scroll + edge fade + fan rotation. Mobile: single-row nowrap with
 * horizontal scroll, no fan.
 */
export function HandCards({
  cards,
  selectedUids,
  onToggleSelect,
  cardVariant,
  disabled = false,
  showName = true,
  showDescription = true,
  isFanned = true,
  onDoubleClick,
}: HandCardsProps) {
  const selected = useMemo(() => new Set(selectedUids), [selectedUids]);
  const countsById = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cards) counts.set(c.id, (counts.get(c.id) ?? 0) + 1);
    return counts;
  }, [cards]);

  return (
    <div
      className="flex flex-row flex-1 flex-nowrap items-end justify-start gap-2 pb-12 px-4 w-full overflow-x-auto overflow-y-visible overscroll-x-contain no-scrollbar max-[800px]:flex-[0] max-[800px]:basis-[auto] max-[800px]:w-full max-[800px]:min-h-[200px]"
      style={{
        paddingTop: isFanned ? 24 : 14,
        WebkitMaskImage: EDGE_FADE_MASK,
        maskImage: EDGE_FADE_MASK,
        WebkitOverflowScrolling: 'touch',
      }}
      data-testid="hand-cards"
    >
      {cards.map((card, i) => {
        // §4.4 — fan transform lives in CSS now (see `styles/hud.scss`);
        // we only set the index/count custom properties here. JS does
        // not compute the transform per render. CSS reads `--hand-index`
        // / `--hand-count` and produces the rotate + translateY.
        // Browsers without `abs()` / `clamp()` (very old) fall through
        // to no fan — cards still render in order, no broken state.
        //
        // Note: per-card `viewTransitionName` was tried in ARC-686 but
        // backed out. The View Transitions API renders pseudo-element
        // snapshots in a top-layer overlay above the document; with one
        // name per card, the overlay briefly showed every old + new card
        // position simultaneously, overlapping the widget for the
        // animation duration. The discard pile still gets a name (see
        // `DiscardPile.tsx`) so the played-card landing animation
        // remains localized.
        const wrapperStyle = {
          '--hand-index': i,
          '--hand-count': cards.length,
        } as CSSProperties & Record<'--hand-index' | '--hand-count', number>;
        return (
          <div
            className="crit-hand-card-wrapper"
            style={wrapperStyle}
            key={card.uid}
            data-fan={isFanned ? 'true' : 'false'}
          >
            <HandCard
              card={card}
              isSelected={selected.has(card.uid)}
              disabled={disabled}
              cardVariant={cardVariant}
              count={countsById.get(card.id)}
              showName={showName}
              showDescription={showDescription}
              onToggle={() => onToggleSelect(card.uid)}
              onDoubleClick={
                onDoubleClick ? () => onDoubleClick(card.uid) : undefined
              }
            />
          </div>
        );
      })}
    </div>
  );
}
