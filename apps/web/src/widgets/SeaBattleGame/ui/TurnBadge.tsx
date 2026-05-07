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
      backgroundColor={
        isYourTurn ? '$successBgSoft' : 'rgba(255, 255, 255, 0.06)'
      }
      borderColor={isYourTurn ? '$successBorder' : 'rgba(255, 255, 255, 0.1)'}
    >
      <YStack
        width={7}
        height={7}
        borderRadius={100}
        className={isYourTurn ? 'sb-dot-blink' : undefined}
        backgroundColor={isYourTurn ? '$success' : '$color'}
        opacity={isYourTurn ? 1 : 0.3}
      />
      <Text
        fontSize={11}
        fontWeight="600"
        letterSpacing={0.8}
        color={isYourTurn ? '$success' : '$color'}
        opacity={isYourTurn ? 1 : 0.5}
      >
        {text}
      </Text>
    </XStack>
  );
}
