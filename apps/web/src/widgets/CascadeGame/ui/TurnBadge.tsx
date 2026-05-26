'use client';

import { XStack, YStack } from 'tamagui';
import { useCascadeTheme } from '../lib/CascadeThemeContext';
import type { ActiveColor } from '../types';

interface TurnBadgeProps {
  currentEntryId: string | null;
  myTurn: boolean;
  activeColor: ActiveColor;
  direction: 1 | -1;
  pendingDraw: number;
}

export function TurnBadge({
  currentEntryId,
  myTurn,
  activeColor,
  direction,
  pendingDraw,
}: TurnBadgeProps) {
  const theme = useCascadeTheme();

  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      gap="$3"
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius="$3"
      backgroundColor="rgba(0,0,0,0.25)"
    >
      <YStack>
        <span style={{ color: '#d1d5db', fontSize: 12 }}>
          {myTurn
            ? 'Your turn'
            : currentEntryId
              ? `Waiting on ${shortId(currentEntryId)}`
              : 'Waiting…'}
        </span>
        <span style={{ color: theme.cardText, fontSize: 14, fontWeight: 600 }}>
          {direction === 1 ? 'Clockwise ↻' : 'Counter-clockwise ↺'}
        </span>
      </YStack>
      <XStack alignItems="center" gap="$2">
        {pendingDraw > 0 ? (
          <YStack
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius="$2"
            backgroundColor="rgba(239, 68, 68, 0.9)"
          >
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>
              +{pendingDraw} stacked
            </span>
          </YStack>
        ) : null}
        <YStack
          alignItems="center"
          justifyContent="center"
          width={36}
          height={36}
          borderRadius={18}
          backgroundColor={theme.palette[activeColor]}
          borderWidth={2}
          borderColor={theme.cardBorder}
          aria-label={`Active color ${activeColor}`}
        >
          <span style={{ color: '#fff', fontWeight: 800 }}>{activeColor}</span>
        </YStack>
      </XStack>
    </XStack>
  );
}

function shortId(id: string): string {
  if (id.startsWith('bot-')) return 'Bot';
  return id.slice(0, 6) + '…';
}
