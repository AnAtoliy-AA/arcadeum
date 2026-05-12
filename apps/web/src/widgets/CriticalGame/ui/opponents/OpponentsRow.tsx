'use client';

import { XStack, useMedia } from 'tamagui';
import { OpponentTile } from './OpponentTile';
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
  const media = useMedia();
  const isMobile = media.sm;
  const isDuel = opponents.length <= 1;

  return (
    <XStack
      data-testid="opponents-row"
      data-mode={isDuel ? 'duel' : 'ffa'}
      data-count={opponents.length}
      width="100%"
      gap="$2"
      paddingHorizontal="$2"
      paddingVertical="$2"
      justifyContent={isDuel ? 'center' : 'space-between'}
      flexWrap={isMobile ? 'nowrap' : 'wrap'}
      overflow={isMobile ? 'scroll' : 'visible'}
      $sm={{ gap: '$1' }}
    >
      {opponents.map((opponent) => (
        <OpponentTile
          key={opponent.playerId}
          player={opponent}
          isCurrentTurn={opponent.playerId === currentTurnPlayerId}
          isTarget={!!targetPlayerId && opponent.playerId === targetPlayerId}
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
