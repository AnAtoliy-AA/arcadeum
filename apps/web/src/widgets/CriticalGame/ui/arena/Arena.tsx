'use client';

import { XStack } from 'tamagui';
import type { CriticalCard, CriticalLogEntry } from '../../types';
import { DrawPile } from './DrawPile';
import { DiscardPile } from './DiscardPile';
import { ArenaCenter } from './ArenaCenter';
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
      />
      <DiscardPile pile={discardPile} cardVariant={cardVariant} />
    </XStack>
  );
}
