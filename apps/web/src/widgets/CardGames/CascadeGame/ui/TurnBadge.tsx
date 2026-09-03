'use client';

import { InGameAvatar } from '@/features/games/ui/InGameAvatar';
import { resolveDisplayName } from '@/features/games/lib/resolveDisplayName';
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
    <div
      className={`flex flex-row items-center justify-between gap-3 px-3 py-2 rounded-xl ${`${styles.turnBar} ${myTurn ? styles.turnBarActive : ''}`}`}
    >
      <div className="flex flex-row items-center gap-2">
        {currentEntryId ? (
          <InGameAvatar
            playerId={currentEntryId}
            name={resolveDisplayName(currentEntryId, { members })}
            size="sm"
            data-testid="cascade-turn-avatar"
          />
        ) : null}
        <div className="flex flex-col items-stretch">
          <span className={styles.turnLabelMuted}>
            {myTurn
              ? t('games.cascade_v1.board.yourTurn')
              : currentEntryId
                ? t('games.cascade_v1.board.waitingOn', {
                    player: resolveDisplayName(currentEntryId, { members }),
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
        </div>
      </div>
      <div className="flex flex-row items-center gap-2">
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
      </div>
    </div>
  );
}
