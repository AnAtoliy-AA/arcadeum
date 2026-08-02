'use client';

import { memo, useMemo } from 'react';
import { XStack, Text } from 'tamagui';
import { useCatDashTheme } from '../lib/CatDashThemeContext';
import type { CatDashClientState } from '../types';

import { RealisticCat } from './RealisticCat';

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
      gap="$3"
      paddingVertical="$3"
      paddingHorizontal="$4"
      backgroundColor={
        myTurn ? 'rgba(124, 58, 237, 0.18)' : 'rgba(255, 255, 255, 0.03)'
      }
      borderRadius="$5"
      borderWidth={1.5}
      borderColor={myTurn ? tokens.playerBorder : tokens.trackBorder}
      style={{
        backdropFilter: 'blur(12px)',
        boxShadow: myTurn
          ? `0 8px 32px ${tokens.playerBorder}33`
          : '0 8px 32px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <RealisticCat catId={currentPlayer.catId} size={24} />
      <Text
        fontSize={14}
        fontWeight="bold"
        color={tokens.text}
        letterSpacing={0.5}
      >
        {myTurn
          ? '🎲 Your turn — roll the dice!'
          : `⏳ ${resolveName(currentEntryId)} is rolling...`}
      </Text>
    </XStack>
  );
});
