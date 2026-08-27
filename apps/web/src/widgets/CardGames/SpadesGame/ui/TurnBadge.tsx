'use client';

import { memo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { cx } from '@arcadeum/ui/utils/cx';
import type { GameRoomMemberSummary } from '@/shared/types/games';

interface TurnBadgeProps {
  currentEntryId: string | null;
  myTurn: boolean;
  phase: string;
  members?: GameRoomMemberSummary[];
}

export const TurnBadge = memo(function TurnBadge({
  currentEntryId,
  myTurn,
  phase,
  members,
}: TurnBadgeProps) {
  const { t } = useTranslation();

  const getPlayerName = (playerId: string | null) => {
    if (!playerId) return '';
    return (
      members?.find((m) => m.id === playerId)?.displayName ??
      playerId.slice(0, 8)
    );
  };

  let label: string;
  if (phase === 'bidding') {
    label = t('games.spades_v1.game.biddingPhase');
  } else if (phase === 'game_over') {
    label = t('games.spades_v1.game.gameOver');
  } else if (myTurn) {
    label = t('games.spades_v1.game.yourTurn');
  } else if (currentEntryId) {
    label = t('games.spades_v1.game.playerTurn', {
      player: getPlayerName(currentEntryId),
    });
  } else {
    label = t('games.spades_v1.game.waitingForOpponent');
  }

  return (
    <div className="flex items-center justify-center">
      <div
        data-testid="spades-turn-badge"
        className={cx(
          'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur-sm transition-all',
          myTurn
            ? 'animate-pulse border-transparent bg-[var(--primary)] text-[var(--primaryText)]'
            : 'border-[var(--glassBorder)] bg-[var(--glassBg)] text-[var(--foreground)]',
        )}
      >
        <span
          aria-hidden="true"
          className={
            myTurn ? 'text-[var(--accent)]' : 'text-[var(--spadeColor)]'
          }
        >
          ♠
        </span>
        {label}
      </div>
    </div>
  );
});
