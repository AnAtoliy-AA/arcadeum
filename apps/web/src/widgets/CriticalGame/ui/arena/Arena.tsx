'use client';

import { XStack } from 'tamagui';
import type { CriticalCard, CriticalLogEntry } from '../../types';
import { DrawPile } from './DrawPile';
import { DiscardPile } from './DiscardPile';
import { ArenaCenter } from './ArenaCenter';
import { useIsNarrow } from '../../lib/useNarrowViewport';
import type { ComboKind } from './ComboCard';

interface ArenaProps {
  deck: CriticalCard[];
  discardPile: CriticalCard[];
  cardVariant?: string;
  isMyTurn: boolean;
  isGameOver: boolean;
  onDrawAndEnd: () => void;
  // ArenaCenter passthrough
  hand: CriticalCard[];
  allowActionCardCombos: boolean;
  combo?: { kind: ComboKind; label: string };
  currentPlayerName: string;
  pendingDraws: number;
  logs: CriticalLogEntry[];
  formatLogMessage: (message?: string | null) => string;
  /** Server-authoritative overload odds (0-100). Forwarded to ThreatStrip. */
  serverOverloadOdds?: number | null;
  /** Cards the snapshot has hidden — folded into client-fallback odds. */
  hiddenCount?: number;
}

/**
 * Three-column arena row (draw · center · discard) — Row 2 of the §7
 * widget layout. The center column hosts the turn pill, combo intent
 * card, threat strip, and an absolutely-positioned flash banner.
 */
export function Arena({
  deck,
  discardPile,
  cardVariant,
  isMyTurn,
  isGameOver,
  onDrawAndEnd,
  hand,
  allowActionCardCombos,
  combo,
  currentPlayerName,
  pendingDraws,
  logs,
  formatLogMessage,
  serverOverloadOdds,
  hiddenCount,
}: ArenaProps) {
  // Phones get smaller piles so the three-column row still fits at
  // 390px; the layout otherwise stays identical so the threat strip,
  // combo card, and FlashBanner don't fall down 200px below the piles.
  // `useIsNarrow` reads the value broadcast by `NarrowViewportProvider`
  // at the widget root so Arena / HandZone / OpponentsRow / TurnBanner
  // all commit the same viewport flip on the same React frame.
  const isNarrow = useIsNarrow(480);

  return (
    <XStack
      data-testid="arena"
      data-layout={isNarrow ? 'mobile' : 'desktop'}
      width="100%"
      alignItems="center"
      gap="$5"
      paddingHorizontal="$4"
      paddingVertical="$3"
      borderRadius={isNarrow ? 0 : 18}
      borderWidth={isNarrow ? 0 : 1}
      borderColor="rgba(255,255,255,0.06)"
      backgroundColor={isNarrow ? 'transparent' : 'rgba(8,12,20,0.55)'}
      // overflow: hidden keeps hover glows on the piles inside the
      // rounded border on desktop. On phones we drop the card chrome so
      // the row reads as a strip and the FlashBanner overlay can extend
      // past the arena bounds without clipping.
      overflow={isNarrow ? 'visible' : 'hidden'}
      $sm={{
        gap: '$2',
        paddingHorizontal: '$2',
        paddingVertical: '$2',
      }}
    >
      <DrawPile
        deck={deck}
        count={deck.length}
        disabled={!isMyTurn || isGameOver}
        onDraw={onDrawAndEnd}
        cardVariant={cardVariant}
        isNarrow={isNarrow}
      />
      <ArenaCenter
        isMyTurn={isMyTurn}
        currentPlayerName={currentPlayerName}
        pendingDraws={pendingDraws}
        hand={hand}
        allowActionCardCombos={allowActionCardCombos}
        combo={combo}
        deck={deck}
        logs={logs}
        formatLogMessage={formatLogMessage}
        serverOverloadOdds={serverOverloadOdds}
        hiddenCount={hiddenCount}
        isNarrow={isNarrow}
      />
      <DiscardPile
        pile={discardPile}
        cardVariant={cardVariant}
        isNarrow={isNarrow}
      />
    </XStack>
  );
}
