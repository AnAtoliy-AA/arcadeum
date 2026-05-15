'use client';

import { useMemo, type CSSProperties } from 'react';
import { XStack } from 'tamagui';
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
}: HandCardsProps) {
  const selected = useMemo(() => new Set(selectedUids), [selectedUids]);
  const countsById = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cards) counts.set(c.id, (counts.get(c.id) ?? 0) + 1);
    return counts;
  }, [cards]);

  return (
    <XStack
      data-testid="hand-cards"
      flex={1}
      flexWrap="nowrap"
      alignItems="flex-end"
      justifyContent="center"
      gap="$2"
      // paddingTop reserves clearance for the lift + fan bounding-box
      // growth. Fanned (desktop): -8 lift + ~7px quadratic offsetY +
      // rotation growth → 24 covers it. Unfanned (mobile): no fan
      // growth, only the lift + hairline cushion → 14 is enough. The
      // extra 10px matters on phones where the sticky bar adds its own
      // safe-area padding below.
      paddingTop={isFanned ? 24 : 14}
      paddingBottom={12}
      paddingHorizontal="$2"
      width="100%"
      // Single horizontally scrolling row — never wraps to a second row.
      style={{
        overflowX: 'auto',
        overflowY: 'visible',
        WebkitMaskImage: EDGE_FADE_MASK,
        maskImage: EDGE_FADE_MASK,
      }}
      $sm={{
        flex: 0,
        flexBasis: 'auto',
        width: '100%',
        minHeight: 200,
        justifyContent: 'flex-start',
      }}
    >
      {cards.map((card, i) => {
        // §4.4 — fan transform lives in CSS now (see `hudStyles.tsx`);
        // we only set the index/count custom properties here. JS does
        // not compute the transform per render. CSS reads `--hand-index`
        // / `--hand-count` and produces the rotate + translateY.
        // Browsers without `abs()` / `clamp()` (very old) fall through
        // to no fan — cards still render in order, no broken state.
        const wrapperStyle = {
          '--hand-index': i,
          '--hand-count': cards.length,
        } as CSSProperties & Record<'--hand-index' | '--hand-count', number>;
        return (
          <div
            key={card.uid}
            className="crit-hand-card-wrapper"
            data-fan={isFanned ? 'true' : 'false'}
            style={wrapperStyle}
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
            />
          </div>
        );
      })}
    </XStack>
  );
}
