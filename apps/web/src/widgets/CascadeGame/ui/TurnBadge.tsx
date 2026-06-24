'use client';

import { XStack, YStack } from 'tamagui';
import { InGameAvatar } from '@/features/games/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useCascadeTheme } from '../lib/CascadeThemeContext';
import styles from './CascadeGame.module.css';
import type { ActiveColor } from '../types';

interface TurnBadgeProps {
  currentEntryId: string | null;
  myTurn: boolean;
  activeColor: ActiveColor;
  direction: 1 | -1;
  pendingDraw: number;
  members?: Array<{ id: string; displayName: string }>;
}

export function TurnBadge({
  currentEntryId,
  myTurn,
  activeColor,
  direction,
  pendingDraw,
  members,
}: TurnBadgeProps) {
  const theme = useCascadeTheme();
  const { t } = useTranslation();

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
            name={shortId(currentEntryId, members)}
            size="sm"
            data-testid="cascade-turn-avatar"
          />
        ) : null}
        <YStack>
          <span className={styles.turnLabelMuted}>
            {myTurn
              ? t('games.cascade_v1.board.yourTurn')
              : currentEntryId
                ? t('games.cascade_v1.board.waitingOn', {
                    player: shortId(currentEntryId, members),
                  })
                : t('games.cascade_v1.board.waiting')}
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
            {direction === 1
              ? t('games.cascade_v1.board.clockwise')
              : t('games.cascade_v1.board.counterClockwise')}
          </span>
        </YStack>
      </XStack>
      <XStack alignItems="center" gap="$2">
        {pendingDraw > 0 ? (
          <span className={styles.stackBadge}>
            {t('games.cascade_v1.board.stacked', { n: pendingDraw })}
          </span>
        ) : null}
        <span
          className={styles.colorChip}
          style={
            {
              background: theme.palette[activeColor],
              '--chip-glow': theme.palette[activeColor],
            } as React.CSSProperties
          }
          aria-label={t('games.cascade_v1.status.activeColor', {
            color: activeColor,
          })}
        >
          {activeColor}
        </span>
      </XStack>
    </XStack>
  );
}

function shortId(
  id: string,
  members?: Array<{ id: string; displayName: string }>,
): string {
  if (id.startsWith('bot-')) return 'Bot';
  const member = members?.find((m) => m.id === id);
  if (member?.displayName) return member.displayName;
  return id.slice(0, 6) + '…';
}
