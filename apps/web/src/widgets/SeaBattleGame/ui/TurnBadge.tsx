'use client';

import { XStack, YStack, Text } from 'tamagui';

interface TurnBadgeProps {
  isYourTurn: boolean;
  text: string;
}

export function TurnBadge({ isYourTurn, text }: TurnBadgeProps) {
  return (
    <XStack
      alignItems="center"
      gap="$2"
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius={20}
      borderWidth={1}
      className={isYourTurn ? 'sb-turn-pulse' : undefined}
      style={{
        background: isYourTurn
          ? 'rgba(16, 185, 129, 0.12)'
          : 'rgba(255, 255, 255, 0.06)',
        borderColor: isYourTurn
          ? 'rgba(16, 185, 129, 0.4)'
          : 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <YStack
        width={7}
        height={7}
        borderRadius={100}
        className={isYourTurn ? 'sb-dot-blink' : undefined}
        backgroundColor={isYourTurn ? '#10b981' : 'rgba(255,255,255,0.3)'}
      />
      <Text
        fontSize={11}
        fontWeight="600"
        letterSpacing={0.8}
        color={isYourTurn ? '#10b981' : 'rgba(255,255,255,0.5)'}
      >
        {text}
      </Text>
    </XStack>
  );
}
