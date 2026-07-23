'use client';

import { memo, useMemo } from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { useCatDashTheme } from '../lib/CatDashThemeContext';
import type { CatDashClientState } from '../types';

interface BoardProps {
  snapshot: CatDashClientState;
  disabled: boolean;
}

export const CatDashBoard = memo(function CatDashBoard({
  snapshot,
  disabled: _disabled,
}: BoardProps) {
  const { tokens } = useCatDashTheme();

  const spaceWidth = useMemo(() => {
    return `${100 / snapshot.track.length}%`;
  }, [snapshot.track.length]);

  return (
    <YStack gap="$2" alignItems="center" width="100%" padding="$3">
      <XStack
        width="100%"
        gap={2}
        flexWrap="nowrap"
        overflow="hidden"
        paddingVertical="$2"
        backgroundColor={tokens.track}
        borderRadius="$4"
        borderWidth={2}
        borderColor={tokens.trackBorder}
      >
        {snapshot.track.map((space) => {
          const isPlayerHere = snapshot.players.some(
            (p) => p.position === space.id && p.isReady,
          );
          const playerOnSpace = snapshot.players.find(
            (p) => p.position === space.id && p.isReady,
          );

          let bgColor = tokens.normalSpace;
          if (space.type === 'obstacle') bgColor = tokens.obstacleSpace;
          else if (space.type === 'bonus') bgColor = tokens.bonusSpace;
          else if (space.type === 'fork') bgColor = tokens.forkSpace;

          return (
            <XStack
              key={space.id}
              width={spaceWidth}
              height={48}
              alignItems="center"
              justifyContent="center"
              backgroundColor={bgColor}
              borderRadius="$2"
              borderWidth={isPlayerHere ? 2 : 1}
              borderColor={isPlayerHere ? tokens.playerBorder : 'transparent'}
              position="relative"
            >
              {isPlayerHere && playerOnSpace && (
                <XStack
                  backgroundColor={tokens.player}
                  borderRadius={9999}
                  width={28}
                  height={28}
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={2}
                  borderColor={tokens.playerBorder}
                >
                  <Text fontSize={10} color={tokens.text} fontWeight="bold">
                    {space.id}
                  </Text>
                </XStack>
              )}
              {!isPlayerHere && (
                <Text fontSize={8} color={tokens.textSecondary} opacity={0.5}>
                  {space.id}
                </Text>
              )}
            </XStack>
          );
        })}
      </XStack>

      <XStack gap="$4" marginTop="$2">
        {snapshot.players.map((player) => (
          <XStack
            key={player.playerId}
            gap="$1"
            alignItems="center"
            opacity={player.isReady ? 1 : 0.4}
          >
            <XStack
              width={12}
              height={12}
              borderRadius={9999}
              backgroundColor={tokens.player}
              borderWidth={1}
              borderColor={tokens.playerBorder}
            />
            <Text fontSize={11} color={tokens.textSecondary} numberOfLines={1}>
              {player.playerId.slice(0, 8)}
            </Text>
            <Text fontSize={10} color={tokens.textSecondary}>
              🎲{player.powerTokens}
            </Text>
          </XStack>
        ))}
      </XStack>
    </YStack>
  );
});
