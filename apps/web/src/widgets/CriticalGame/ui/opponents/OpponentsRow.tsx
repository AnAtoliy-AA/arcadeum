'use client';

import { useMemo } from 'react';
import { OpponentTile } from './OpponentTile';
import { useIsNarrow } from '../../lib/useNarrowViewport';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import type { CriticalLogEntry, CriticalPlayerTableState } from '../../types';

interface OpponentsRowProps {
  opponents: CriticalPlayerTableState[];
  /**
   * Player id whose turn it currently is. May be a non-opponent (the
   * current user). Only opponents whose id matches this get the turn ring.
   */
  currentTurnPlayerId: string | null;
  /**
   * Player id currently armed for an attack. ARC-635 wires this from the
   * hand zone's selection state.
   */
  targetPlayerId?: string | null;
  /**
   * Called when an opponent tile is activated. Omitted when target
   * selection isn't possible — e.g. the local player isn't on the clock,
   * or no targeted card is selected.
   */
  onSelectTarget?: (playerId: string) => void;
  resolveDisplayName: (playerId: string, fallback: string) => string;
  /**
   * Match log feed. Each tile picks its own latest `message`-type entry
   * out of this list to render the chat bubble / Sea Battle popup —
   * gating this at the row level avoids prop-drilling per-opponent
   * filtering work into the row.
   */
  logs?: CriticalLogEntry[];
}

/**
 * Top row of the widget-mode match: opponents laid out horizontally.
 * Duel mode renders one tile centered; FFA mode (≥3 players including
 * self → ≥2 opponents) renders the full 5-up grid. Beyond 5 opponents
 * the row scrolls horizontally on mobile and wraps on desktop.
 */
export function OpponentsRow({
  opponents,
  currentTurnPlayerId,
  targetPlayerId,
  onSelectTarget,
  resolveDisplayName,
  logs,
}: OpponentsRowProps) {
  // Use the ≤480px hook (not the legacy `sm` breakpoint) so tablet portrait keeps
  // the desktop layout. Mobile picks up scroll-snap + smaller tiles.
  // Value comes from `NarrowViewportProvider` at the widget root.
  const isMobile = useIsNarrow(480);
  const isDuel = opponents.length <= 1;

  // Idle players come from gameStore. Subscribing here once + memoizing a
  // Set keeps the 5 tiles from each running `.includes` on every state
  // update — at 5 opponents that's 5 subscriptions × O(n) scans per frame.
  const idlePlayers = useGameStore((s: GameState) => s.idlePlayers);
  const idleSet = useMemo(() => new Set(idlePlayers), [idlePlayers]);

  return (
    <div
      className="flex flex-row items-stretch w-full gap-3 px-2 py-2 justify-center flex-nowrap shrink-0 max-[800px]:gap-2"
      style={
        isMobile
          ? {
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollSnapType: 'x mandatory',
            }
          : { overflow: 'visible' }
      }
      data-testid="opponents-row"
      data-mode={isDuel ? 'duel' : 'ffa'}
      data-count={opponents.length}
    >
      {opponents.map((opponent) => (
        <OpponentTile
          key={opponent.playerId}
          player={opponent}
          isCurrentTurn={opponent.playerId === currentTurnPlayerId}
          isTarget={!!targetPlayerId && opponent.playerId === targetPlayerId}
          isDuel={isDuel}
          isMobile={isMobile}
          isIdle={idleSet.has(opponent.playerId)}
          onSelect={
            onSelectTarget && opponent.alive
              ? () => onSelectTarget(opponent.playerId)
              : undefined
          }
          resolveDisplayName={resolveDisplayName}
          logs={logs}
        />
      ))}
    </div>
  );
}
