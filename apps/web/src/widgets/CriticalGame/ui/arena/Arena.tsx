'use client';

import { XStack } from 'tamagui';
import type { CriticalCard } from '../../types';
import { DrawPile } from './DrawPile';
import { DiscardPile } from './DiscardPile';
import { ArenaCenter } from './ArenaCenter';

interface ArenaProps {
  deck: CriticalCard[];
  discardPile: CriticalCard[];
  cardVariant?: string;
  isMyTurn: boolean;
  isGameOver: boolean;
  onDrawAndEnd: () => void;
}

/**
 * Three-column arena row (draw · center · discard) — Row 2 of the §7
 * widget layout. The center column is currently a placeholder slot for
 * the HUD pieces that ARC-633 will move inside it.
 */
export function Arena({
  deck,
  discardPile,
  cardVariant,
  isMyTurn,
  isGameOver,
  onDrawAndEnd,
}: ArenaProps) {
  return (
    <XStack
      data-testid="arena"
      width="100%"
      alignItems="center"
      justifyContent="space-between"
      gap="$4"
      paddingHorizontal="$3"
      $sm={{ gap: '$2', paddingHorizontal: '$2' }}
    >
      <DrawPile
        deck={deck}
        count={deck.length}
        disabled={!isMyTurn || isGameOver}
        onDraw={onDrawAndEnd}
        cardVariant={cardVariant}
      />
      <ArenaCenter />
      <DiscardPile pile={discardPile} cardVariant={cardVariant} />
    </XStack>
  );
}
