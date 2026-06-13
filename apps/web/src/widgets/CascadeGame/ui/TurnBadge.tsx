'use client';

import { XStack, YStack } from 'tamagui';
import { InGameAvatar } from '@/features/games/ui';
import { useCascadeTheme } from '../lib/CascadeThemeContext';
import styles from './CascadeGame.module.css';
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
      className={`${styles.turnBar} ${myTurn ? styles.turnBarActive : ''}`}
    >
      <XStack alignItems="center" gap="$2">
        {currentEntryId ? (
          <InGameAvatar
            playerId={currentEntryId}
            name={shortId(currentEntryId)}
            size="sm"
            data-testid="cascade-turn-avatar"
          />
        ) : null}
        <YStack>
          <span className={styles.turnLabelMuted}>
            {myTurn
              ? 'Your turn'
              : currentEntryId
                ? `Waiting on ${shortId(currentEntryId)}`
                : 'Waiting…'}
          </span>
          <span className={styles.turnLabelStrong}>
            <span
              className={`${styles.dirArrow} ${
                direction === -1 ? styles.dirArrowReverse : ''
              }`}
              aria-hidden="true"
            >
              ↻
            </span>
            {direction === 1 ? 'Clockwise' : 'Counter-clockwise'}
          </span>
        </YStack>
      </XStack>
      <XStack alignItems="center" gap="$2">
        {pendingDraw > 0 ? (
          <span className={styles.stackBadge}>+{pendingDraw} stacked</span>
        ) : null}
        <span
          className={styles.colorChip}
          style={
            {
              background: theme.palette[activeColor],
              '--chip-glow': theme.palette[activeColor],
            } as React.CSSProperties
          }
          aria-label={`Active color ${activeColor}`}
        >
          {activeColor}
        </span>
      </XStack>
    </XStack>
  );
}

function shortId(id: string): string {
  if (id.startsWith('bot-')) return 'Bot';
  return id.slice(0, 6) + '…';
}
