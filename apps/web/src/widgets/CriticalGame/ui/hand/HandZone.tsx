'use client';

import { XStack } from 'tamagui';
import { HandCards } from './HandCards';
import { HandRail } from './HandRail';
import type { HandCardInstance, ComboKind } from '../../lib/combo';

interface HandZoneProps {
  cards: HandCardInstance[];
  selectedUids: string[];
  onToggleSelect: (uid: string) => void;
  combo: { kind: ComboKind; label: string };
  defuseCount: number;
  canPlay: boolean;
  canDraw: boolean;
  canNope: boolean;
  cardVariant?: string;
  onPlay: () => void;
  onDraw: () => void;
  onNope: () => void;
}

/**
 * Row 3 of the widget layout: rail on the left, horizontal card track
 * on the right. Selection state is owned by `MatchWidget` so the arena
 * `ComboCard` can read it too.
 *
 * Wraps to a column on mobile so the rail sits above the cards (and the
 * buttons stay thumb-reachable).
 */
export function HandZone(props: HandZoneProps) {
  return (
    <XStack
      data-testid="hand-zone"
      width="100%"
      gap="$3"
      paddingHorizontal="$2"
      paddingVertical="$2"
      $sm={{
        flexDirection: 'column-reverse',
        gap: '$2',
      }}
    >
      <HandRail
        handCount={props.cards.length}
        defuseCount={props.defuseCount}
        combo={props.combo}
        canPlay={props.canPlay}
        canDraw={props.canDraw}
        canNope={props.canNope}
        cardVariant={props.cardVariant}
        onPlay={props.onPlay}
        onDraw={props.onDraw}
        onNope={props.onNope}
      />
      <HandCards
        cards={props.cards}
        selectedUids={props.selectedUids}
        onToggleSelect={props.onToggleSelect}
        cardVariant={props.cardVariant}
      />
    </XStack>
  );
}
