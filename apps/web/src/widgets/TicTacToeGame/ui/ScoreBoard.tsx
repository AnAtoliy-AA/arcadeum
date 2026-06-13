'use client';

import { XStack, YStack, Text } from 'tamagui';

interface ScoreEntry {
  id: string;
  name: string;
  color?: string;
  score: number;
}

interface ScoreBoardProps {
  entries: ScoreEntry[];
  drawCount: number;
}

export function ScoreBoard({ entries, drawCount }: ScoreBoardProps) {
  return (
    <XStack
      data-testid="ttt-scoreboard"
      gap="$3"
      paddingVertical="$2"
      paddingHorizontal="$3"
      borderRadius="$4"
      backgroundColor="$backgroundHover"
      alignSelf="center"
    >
      {entries.map((entry) => (
        <YStack key={entry.id} alignItems="center" minWidth={56}>
          <Text fontSize="$2" color={entry.color ?? '$color'}>
            {entry.name}
          </Text>
          <Text fontWeight="800" fontSize="$5">
            {entry.score}
          </Text>
        </YStack>
      ))}
      <YStack alignItems="center" minWidth={56}>
        <Text fontSize="$2" opacity={0.7}>
          Draws
        </Text>
        <Text fontWeight="800" fontSize="$5">
          {drawCount}
        </Text>
      </YStack>
    </XStack>
  );
}
