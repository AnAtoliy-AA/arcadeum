'use client';

import { XStack, Text } from 'tamagui';
import { InGameAvatar } from '@/features/games/ui';
import { useCheckersTheme } from '../lib/CheckersThemeContext';
import type { CheckersPlayer } from '../types';

interface TurnBadgeProps {
  currentTurnUserId: string | null;
  players: CheckersPlayer[];
  myTurn: boolean;
  resolveName?: (id?: string | null) => string;
}

export function TurnBadge({
  currentTurnUserId,
  players,
  myTurn,
  resolveName,
}: TurnBadgeProps) {
  const theme = useCheckersTheme();
  if (!currentTurnUserId) return null;

  const player = players.find((p) => p.playerId === currentTurnUserId);
  const display =
    resolveName?.(player?.playerId) ?? player?.playerId ?? currentTurnUserId;

  return (
    <XStack
      data-testid="checkers-turn-badge"
      paddingVertical="$2"
      paddingHorizontal="$3"
      borderRadius={999}
      backgroundColor={myTurn ? '$green10' : '$backgroundHover'}
      borderWidth={myTurn ? 0 : 1}
      borderColor="$borderColor"
      alignSelf="center"
      alignItems="center"
      gap="$2"
    >
      <InGameAvatar
        playerId={currentTurnUserId}
        name={display}
        size="sm"
        data-testid="checkers-turn-avatar"
      />
      <Text fontWeight="700" color={myTurn ? '$white' : theme.textColor}>
        {myTurn ? 'Your turn' : `${display}'s turn`}
      </Text>
    </XStack>
  );
}
