'use client';

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
  /** Resolves a log entry's senderId for the FlashHistory actor column. */
  resolveDisplayName?: (playerId: string, fallback: string) => string;
  /** Server-authoritative overload odds (0-100). Forwarded to ThreatStrip. */
  serverOverloadOdds?: number | null;
  /** Cards the snapshot has hidden — folded into client-fallback odds. */
  hiddenCount?: number;
}

/**
 * Three-column arena row (draw · center · discard) — Row 2 of the §7
 * widget layout. The center column hosts the turn pill, combo intent
 * card, threat strip, and an absolutely-positioned flash banner.
 *
 * Layout lives in CSS now (`.match-arena` in `hudStyles.tsx`) — desktop
 * is a 3-column grid, mobile re-stacks via `grid-template-areas` to
 * `center / center` over `draw / discard`. The JS `isNarrow` flip
 * stays only for the pile / center children whose internal layout
 * still differs between desktop and phone.
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
  resolveDisplayName,
  serverOverloadOdds,
  hiddenCount,
}: ArenaProps) {
  const isNarrow = useIsNarrow(480);

  return (
    <div
      className="match-arena"
      data-testid="arena"
      data-layout={isNarrow ? 'mobile' : 'desktop'}
    >
      <div data-area="draw">
        <DrawPile
          deck={deck}
          count={deck.length}
          disabled={!isMyTurn || isGameOver}
          onDraw={onDrawAndEnd}
          cardVariant={cardVariant}
          isNarrow={isNarrow}
        />
      </div>
      <div data-area="center">
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
          resolveDisplayName={resolveDisplayName}
          serverOverloadOdds={serverOverloadOdds}
          hiddenCount={hiddenCount}
          isNarrow={isNarrow}
        />
      </div>
      <div data-area="discard">
        <DiscardPile
          pile={discardPile}
          cardVariant={cardVariant}
          isNarrow={isNarrow}
        />
      </div>
    </div>
  );
}
