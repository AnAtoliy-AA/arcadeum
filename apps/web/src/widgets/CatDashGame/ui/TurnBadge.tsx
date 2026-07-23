'use client';

import { memo, useMemo } from 'react';
import { XStack, Text } from 'tamagui';
import { useCatDashTheme } from '../lib/CatDashThemeContext';
import type { CatDashClientState } from '../types';

interface TurnBadgeProps {
  snapshot: CatDashClientState;
  currentEntryId: string | null;
  myTurn: boolean;
  resolveName: (id?: string | null) => string;
}

export const CatDashTurnBadge = memo(function CatDashTurnBadge({
  snapshot,
  currentEntryId,
  myTurn,
  resolveName,
}: TurnBadgeProps) {
  const { tokens } = useCatDashTheme();

  const currentPlayer = useMemo(() => {
    if (!currentEntryId) return null;
    return snapshot.players.find((p) => p.playerId === currentEntryId);
  }, [snapshot.players, currentEntryId]);

  if (!currentPlayer) return null;

  return (
    <XStack
      alignItems="center"
      justifyContent="center"
      gap="$2"
      paddingVertical="$2"
      paddingHorizontal="$3"
      backgroundColor={myTurn ? tokens.player : tokens.track}
      borderRadius="$4"
      borderWidth={1}
      borderColor={myTurn ? tokens.playerBorder : tokens.trackBorder}
    >
      <Text
        fontSize={13}
        fontWeight={myTurn ? 'bold' : 'normal'}
        color={tokens.text}
      >
        {myTurn
          ? '🎲 Your turn — roll the dice!'
          : `⏳ ${resolveName(currentEntryId)} is rolling...`}
      </Text>
    </XStack>
  );
});
