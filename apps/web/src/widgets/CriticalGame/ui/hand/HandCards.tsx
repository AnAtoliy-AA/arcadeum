'use client';

import { useMemo } from 'react';
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
}

/**
 * Horizontal card track for the player's hand. Each cell is a `HandCard`
 * — selection state lives one level up in `MatchWidget` so the arena's
 * `ComboCard` can read it too.
 */
export function HandCards({
  cards,
  selectedUids,
  onToggleSelect,
  cardVariant,
  disabled = false,
  showName = true,
  showDescription = true,
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
      flexWrap="wrap"
      gap="$2"
      padding="$2"
      $sm={{ overflow: 'scroll', flexWrap: 'nowrap' }}
    >
      {cards.map((card) => (
        <HandCard
          key={card.uid}
          card={card}
          isSelected={selected.has(card.uid)}
          disabled={disabled}
          cardVariant={cardVariant}
          count={countsById.get(card.id)}
          showName={showName}
          showDescription={showDescription}
          onToggle={() => onToggleSelect(card.uid)}
        />
      ))}
    </XStack>
  );
}
