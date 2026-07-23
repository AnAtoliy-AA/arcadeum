'use client';

import { memo } from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { useCatDashTheme } from '../lib/CatDashThemeContext';
import type { CatDashClientState, CatId } from '../types';

const CAT_EMOJI: Record<CatId, string> = {
  neon: '🐱',
  whiskers: '😺',
  stardust: '✨',
  felix: '🐈',
  shadow: '🐈‍⬛',
  luna: '🌙',
};

const CAT_COLORS: Record<CatId, string> = {
  neon: '#a855f7',
  whiskers: '#f59e0b',
  stardust: '#3b82f6',
  felix: '#22c55e',
  shadow: '#6b7280',
  luna: '#ec4899',
};

const SPACE_EMOJI: Record<string, string> = {
  normal: '',
  obstacle: '🔴',
  bonus: '🟡',
  fork: '🔵',
};

interface BoardProps {
  snapshot: CatDashClientState;
  disabled: boolean;
  resolveName: (id?: string | null) => string;
}

export const CatDashBoard = memo(function CatDashBoard({
  snapshot,
  disabled: _disabled,
  resolveName,
}: BoardProps) {
  const { tokens } = useCatDashTheme();

  return (
    <YStack gap="$3" alignItems="center" width="100%" padding="$3">
      {/* Track */}
      <YStack
        width="100%"
        gap={3}
        padding="$3"
        backgroundColor={tokens.track}
        borderRadius="$4"
        borderWidth={2}
        borderColor={tokens.trackBorder}
      >
        {/* Start / Finish labels */}
        <XStack justifyContent="space-between" paddingHorizontal="$1">
          <Text fontSize={11} fontWeight="bold" color={tokens.textSecondary}>
            START
          </Text>
          <Text fontSize={11} fontWeight="bold" color={tokens.textSecondary}>
            FINISH 🏁
          </Text>
        </XStack>

        {/* Track spaces - 2 rows for better visibility */}
        <XStack gap={2} flexWrap="wrap">
          {snapshot.track.map((space) => {
            const playersHere = snapshot.players.filter(
              (p) => p.position === space.id && p.isReady,
            );
            const isOccupied = playersHere.length > 0;

            let bgColor = tokens.normalSpace;
            if (space.type === 'obstacle') bgColor = tokens.obstacleSpace;
            else if (space.type === 'bonus') bgColor = tokens.bonusSpace;
            else if (space.type === 'fork') bgColor = tokens.forkSpace;

            return (
              <XStack
                key={space.id}
                flex={1}
                minWidth={36}
                height={44}
                alignItems="center"
                justifyContent="center"
                backgroundColor={bgColor}
                borderRadius="$2"
                borderWidth={isOccupied ? 2 : 1}
                borderColor={
                  isOccupied ? tokens.playerBorder : 'rgba(255,255,255,0.1)'
                }
                position="relative"
              >
                {isOccupied ? (
                  <XStack gap={1} alignItems="center" justifyContent="center">
                    {playersHere.map((p) => (
                      <Text key={p.playerId} fontSize={18}>
                        {CAT_EMOJI[p.catId] ?? '🐱'}
                      </Text>
                    ))}
                  </XStack>
                ) : (
                  <Text fontSize={8} color={tokens.textSecondary} opacity={0.4}>
                    {space.id}
                  </Text>
                )}
              </XStack>
            );
          })}
        </XStack>
      </YStack>

      {/* Player legend */}
      <XStack gap="$3" marginTop="$2" flexWrap="wrap" justifyContent="center">
        {snapshot.players.map((player) => {
          const isCurrent =
            snapshot.players[snapshot.currentPlayerIndex]?.playerId ===
            player.playerId;
          return (
            <XStack
              key={player.playerId}
              gap="$1"
              alignItems="center"
              opacity={player.isReady ? 1 : 0.4}
              backgroundColor={
                isCurrent ? 'rgba(124,58,237,0.15)' : 'transparent'
              }
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$3"
              borderWidth={isCurrent ? 1 : 0}
              borderColor={isCurrent ? tokens.playerBorder : 'transparent'}
            >
              <Text fontSize={16}>{CAT_EMOJI[player.catId] ?? '🐱'}</Text>
              <Text
                fontSize={12}
                fontWeight={isCurrent ? 'bold' : 'normal'}
                color={CAT_COLORS[player.catId] ?? tokens.text}
              >
                {resolveName(player.playerId)}
              </Text>
              <Text fontSize={10} color={tokens.textSecondary}>
                🎲 {player.powerTokens}
              </Text>
            </XStack>
          );
        })}
      </XStack>

      {/* Track legend */}
      <XStack gap="$3" marginTop="$1" justifyContent="center">
        {Object.entries(SPACE_EMOJI).map(([type, emoji]) =>
          emoji ? (
            <XStack key={type} gap="$1" alignItems="center">
              <Text fontSize={10}>{emoji}</Text>
              <Text fontSize={9} color={tokens.textSecondary}>
                {type}
              </Text>
            </XStack>
          ) : null,
        )}
      </XStack>
    </YStack>
  );
});
