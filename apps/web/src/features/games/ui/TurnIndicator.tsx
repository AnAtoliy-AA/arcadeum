'use client';

import { memo } from 'react';
import { Text, XStack } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useGameChatStore } from '@/widgets/GameChat';
import { InGameAvatar } from './InGameAvatar';
import type { TurnStatusVariant } from './GameWidgetContainer';

/**
 * Declarative turn contract shared by every game's header. A widget passes only
 * the on-clock player's id + whether it's the local player's turn; the indicator
 * resolves the display name (via the GameChat store resolver registered by each
 * game) and the avatar cosmetics (via {@link InGameAvatar}, which reads equipped
 * items from the game store by `playerId`). This is what makes the avatar+name
 * turn display "free" for any new game.
 */
export interface TurnContract {
  /** id of the player currently on the clock; null when nobody is (setup / between turns) */
  onClockUserId: string | null;
  /** is the local player the one on the clock */
  isMyTurn: boolean;
  /** game finished — show a neutral "completed" state instead of a turn */
  isGameOver?: boolean;
  /** override the resolved display name for the on-clock player (optional) */
  onClockName?: string;
}

/** Map the turn contract onto the header pill's status variant. */
export function resolveTurnStatus(turn: TurnContract): TurnStatusVariant {
  if (turn.isGameOver) return 'completed';
  if (turn.isMyTurn) return 'yourTurn';
  return turn.onClockUserId ? 'waiting' : 'default';
}

const STATUS_COLOR: Record<TurnStatusVariant, string> = {
  yourTurn: '$success',
  waiting: '$warning',
  completed: '$secondary',
  default: '$color',
};

interface TurnIndicatorProps {
  turn: TurnContract;
  'data-testid'?: string;
}

/**
 * Renders the avatar + label that live inside the header turn pill. The pill
 * chrome itself (background / border) is owned by `GameWidgetContainer`, which
 * derives the same status via {@link resolveTurnStatus}.
 */
export const TurnIndicator = memo(function TurnIndicator({
  turn,
  'data-testid': testId,
}: TurnIndicatorProps) {
  const { t } = useTranslation();
  const resolveDisplayName = useGameChatStore((s) => s.resolveDisplayName);
  const fallbackResolveDisplayName = useGameChatStore(
    (s) => s.fallbackResolveDisplayName,
  );

  const status = resolveTurnStatus(turn);
  const { onClockUserId, isMyTurn, isGameOver, onClockName } = turn;

  const resolvedName =
    onClockName ??
    (onClockUserId
      ? (resolveDisplayName?.(onClockUserId) ??
        fallbackResolveDisplayName?.(onClockUserId) ??
        onClockUserId)
      : undefined);

  const label = isGameOver
    ? t('games.table.turn.gameOver')
    : isMyTurn
      ? t('games.table.turn.yourTurn')
      : onClockUserId && resolvedName
        ? t('games.table.turn.otherTurn', { name: resolvedName })
        : t('games.table.turn.waiting');

  // Avatar only makes sense when someone is on the clock and the game is live.
  const showAvatar = !!onClockUserId && !isGameOver;

  return (
    <XStack alignItems="center" gap="$2" data-testid={testId}>
      {showAvatar && resolvedName ? (
        <InGameAvatar
          playerId={onClockUserId}
          name={resolvedName}
          size="icon"
          data-testid="turn-indicator-avatar"
        />
      ) : null}
      <Text
        fontSize={14}
        fontWeight="600"
        color={STATUS_COLOR[status]}
        opacity={status === 'default' ? 0.7 : 1}
        numberOfLines={1}
        data-testid="turn-indicator-label"
      >
        {label}
      </Text>
    </XStack>
  );
});
