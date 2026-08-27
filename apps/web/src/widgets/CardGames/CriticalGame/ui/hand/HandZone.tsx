'use client';

import { HandCards } from './HandCards';
import { HandRail } from './HandRail';
import { MobileHandBar } from './MobileHandBar';
import { useIsNarrow } from '../../lib/useNarrowViewport';
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
  onClearSelection?: () => void;
  onPlay: () => void;
  onDraw: () => void;
  onNope: () => void;
  onOpenRules?: () => void;
  onToggleFullscreen?: () => void;
  onToggleCardName: () => void;
  onToggleCardDescription: () => void;
  /** Fired on double-click / double-tap on a card to play it directly. */
  onDoubleClickCard?: (uid: string) => void;
}

/**
 * Row 3 of the widget layout. Desktop / tablet: rail on the left, card
 * track on the right. Mobile (≤480px): cards live in a horizontally-
 * scrolling track and the rail is replaced by a sticky `MobileHandBar`
 * fixed to the viewport bottom. The body must reserve `paddingBottom:
 * 64` at small screens so cards aren't hidden behind the bar.
 */
export function HandZone(props: HandZoneProps) {
  // The legacy `sm` breakpoint (≤800px) fires on tablet portrait where the desktop
  // rail still has plenty of room. Read the ≤480px value broadcast by
  // `NarrowViewportProvider` at the widget root so HandZone, Arena, and
  // OpponentsRow commit the same flip on the same React frame.
  const isMobile = useIsNarrow(480);
  if (isMobile) {
    return (
      <div
        className="flex flex-col items-stretch w-full min-w-0 gap-2 px-2 pt-2"
        data-testid="hand-zone"
        data-layout="mobile"
      >
        <HandCards
          cards={props.cards}
          selectedUids={props.selectedUids}
          onToggleSelect={props.onToggleSelect}
          cardVariant={props.cardVariant}
          showName={props.showCardName}
          showDescription={props.showCardDescription}
          isFanned={false}
          onDoubleClick={props.onDoubleClickCard}
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
          onClearSelection={props.onClearSelection}
          onPlay={props.onPlay}
          onDraw={props.onDraw}
          onNope={props.onNope}
          onOpenRules={props.onOpenRules}
          onToggleFullscreen={props.onToggleFullscreen}
          onToggleCardName={props.onToggleCardName}
          onToggleCardDescription={props.onToggleCardDescription}
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-row items-stretch w-full min-w-0 gap-3 px-2 py-2"
      data-testid="hand-zone"
      data-layout="desktop"
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
        onClearSelection={props.onClearSelection}
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
        onDoubleClick={props.onDoubleClickCard}
      />
    </div>
  );
}
