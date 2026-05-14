'use client';

import { XStack, YStack } from 'tamagui';
import { HandCards } from './HandCards';
import { HandRail } from './HandRail';
import { MobileHandBar } from './MobileHandBar';
import { useNarrowViewport } from '../../lib/useNarrowViewport';
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
  isFullscreen?: boolean;
  showCardName: boolean;
  showCardDescription: boolean;
  onPlay: () => void;
  onDraw: () => void;
  onNope: () => void;
  onOpenRules?: () => void;
  onToggleFullscreen?: () => void;
  onToggleCardName: () => void;
  onToggleCardDescription: () => void;
}

/**
 * Row 3 of the widget layout. Desktop / tablet: rail on the left, card
 * track on the right. Mobile (≤480px): cards live in a horizontally-
 * scrolling track and the rail is replaced by a sticky `MobileHandBar`
 * fixed to the viewport bottom. The body must reserve `paddingBottom:
 * 64` on `$sm` so cards aren't hidden behind the bar.
 */
export function HandZone(props: HandZoneProps) {
  // Tamagui's `sm` (≤800px) fires on tablet portrait where the desktop
  // rail still has plenty of room. Use a strict ≤480px check so the
  // sticky bar only takes over on phones, matching the preview spec.
  const isMobile = useNarrowViewport(480);

  if (isMobile) {
    return (
      <YStack
        data-testid="hand-zone"
        data-layout="mobile"
        width="100%"
        gap="$2"
        paddingHorizontal="$2"
        paddingTop="$2"
      >
        <HandCards
          cards={props.cards}
          selectedUids={props.selectedUids}
          onToggleSelect={props.onToggleSelect}
          cardVariant={props.cardVariant}
          showName={props.showCardName}
          showDescription={props.showCardDescription}
          isFanned={false}
        />
        <MobileHandBar
          handCount={props.cards.length}
          defuseCount={props.defuseCount}
          combo={props.combo}
          canPlay={props.canPlay}
          canDraw={props.canDraw}
          canNope={props.canNope}
          isFullscreen={props.isFullscreen}
          showCardName={props.showCardName}
          showCardDescription={props.showCardDescription}
          onPlay={props.onPlay}
          onDraw={props.onDraw}
          onNope={props.onNope}
          onOpenRules={props.onOpenRules}
          onToggleFullscreen={props.onToggleFullscreen}
          onToggleCardName={props.onToggleCardName}
          onToggleCardDescription={props.onToggleCardDescription}
        />
      </YStack>
    );
  }

  return (
    <XStack
      data-testid="hand-zone"
      data-layout="desktop"
      width="100%"
      gap="$3"
      paddingHorizontal="$2"
      paddingVertical="$2"
    >
      <HandRail
        handCount={props.cards.length}
        defuseCount={props.defuseCount}
        combo={props.combo}
        canPlay={props.canPlay}
        canDraw={props.canDraw}
        canNope={props.canNope}
        cardVariant={props.cardVariant}
        isFullscreen={props.isFullscreen}
        showCardName={props.showCardName}
        showCardDescription={props.showCardDescription}
        onToggleCardName={props.onToggleCardName}
        onToggleCardDescription={props.onToggleCardDescription}
        onPlay={props.onPlay}
        onDraw={props.onDraw}
        onNope={props.onNope}
        onOpenRules={props.onOpenRules}
        onToggleFullscreen={props.onToggleFullscreen}
      />
      <HandCards
        cards={props.cards}
        selectedUids={props.selectedUids}
        onToggleSelect={props.onToggleSelect}
        cardVariant={props.cardVariant}
        showName={props.showCardName}
        showDescription={props.showCardDescription}
      />
    </XStack>
  );
}
