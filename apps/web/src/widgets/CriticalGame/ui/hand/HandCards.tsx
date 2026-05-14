'use client';

import { useMemo } from 'react';
import { XStack } from 'tamagui';
import { HandCard } from './HandCard';
import { getFanTransform } from '../../lib/handLayout';
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
      // paddingTop reserves clearance for the combined lift + fan
      // bounding-box growth. The selected lift is -8 / hover -10, and
      // `getFanTransform` adds quadratic offsetY up to ~7px at the
      // edges; rotation grows the rotated rect further still. 24 covers
      // both at a 7-card hand with selected lift on an outer card.
      paddingTop={24}
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
        const fan = isFanned ? getFanTransform(i, cards.length) : null;
        // Apply the fan via a wrapping div instead of HandCard's
        // transform prop — HandCard already uses transform for the
        // selected-state lift, so we keep the two concerns separated.
        const fanStyle = fan
          ? {
              transform: `rotate(${fan.angle}deg) translateY(${fan.offsetY}px)`,
              transformOrigin: 'bottom center',
              display: 'inline-flex',
              flexShrink: 0,
            }
          : { display: 'inline-flex', flexShrink: 0 };
        return (
          <div key={card.uid} style={fanStyle}>
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
