'use client';

import { useMemo } from 'react';
import { XStack } from 'tamagui';
import { OpponentTile } from './OpponentTile';
import { useIsNarrow } from '../../lib/useNarrowViewport';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import type { CriticalPlayerTableState } from '../../types';

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
}: OpponentsRowProps) {
  // Use the ≤480px hook (not tamagui's `sm`) so tablet portrait keeps
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
    <XStack
      data-testid="opponents-row"
      data-mode={isDuel ? 'duel' : 'ffa'}
      data-count={opponents.length}
      width="100%"
      gap="$3"
      paddingHorizontal="$2"
      paddingVertical="$2"
      justifyContent="center"
      flexWrap="nowrap"
      // Mobile: horizontal scroll with scroll-snap so each tile lands on
      // a fixed stop instead of free-floating. Desktop: tiles flex-grow
      // evenly with a max width so 2-/3-/4-up rows look balanced rather
      // than space-between-clumped.
      style={
        isMobile
          ? {
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollSnapType: 'x mandatory',
            }
          : { overflow: 'visible' }
      }
      $sm={{ gap: '$2' }}
    >
      {opponents.map((opponent) => (
        <OpponentTile
          key={opponent.playerId}
          player={opponent}
          isCurrentTurn={opponent.playerId === currentTurnPlayerId}
          isTarget={!!targetPlayerId && opponent.playerId === targetPlayerId}
          isDuel={isDuel}
          isMobile={isMobile}
          avatarSize={getAvatarSize(opponents.length, isDuel, isMobile)}
          isIdle={idleSet.has(opponent.playerId)}
          onSelect={
            onSelectTarget && opponent.alive
              ? () => onSelectTarget(opponent.playerId)
              : undefined
          }
          resolveDisplayName={resolveDisplayName}
        />
      ))}
    </XStack>
  );
}

/**
 * Avatar diameter for a tile, scaled by FFA opponent count so a 5-up row
 * doesn't look avatar-dominated and a 3-up row doesn't look sparse. Duel
 * mode locks to the focal size — there's only one tile, no crowding to
 * worry about. Mobile knocks both branches down so tiles fit thumb-width.
 */
function getAvatarSize(
  count: number,
  isDuel: boolean,
  isMobile: boolean,
): number {
  if (isMobile) return isDuel ? 64 : 36;
  if (isDuel) return 88;
  if (count >= 5) return 40;
  if (count === 4) return 44;
  return 56;
}
