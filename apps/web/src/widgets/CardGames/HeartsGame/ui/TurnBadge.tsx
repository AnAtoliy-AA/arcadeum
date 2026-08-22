'use client';

import { memo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { PassDirection } from '../types';
import { PASS_DIRECTION_LABELS } from '../lib/constants';

interface TurnBadgeProps {
  currentEntryId: string | null;
  myTurn: boolean;
  phase: string;
  passDirection?: PassDirection;
  members?: Array<{ id: string; name?: string }>;
}

export const TurnBadge = memo(function TurnBadge({
  currentEntryId,
  myTurn,
  phase,
  passDirection,
  members,
}: TurnBadgeProps) {
  const { t } = useTranslation();

  const getPlayerName = (playerId: string | null) => {
    if (!playerId) return '';
    return (
      members?.find((m) => m.id === playerId)?.name ?? playerId.slice(0, 8)
    );
  };

  let label: string;
  if (phase === 'passing') {
    const dirKey = passDirection ? PASS_DIRECTION_LABELS[passDirection] : null;
    label = dirKey ? t(dirKey) : 'Passing phase';
  } else if (phase === 'hand_over') {
    label = 'Hand complete';
  } else if (phase === 'game_over') {
    label = 'Game over';
  } else if (myTurn) {
    label = 'Your turn';
  } else {
    label = `${getPlayerName(currentEntryId)}'s turn`;
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          px-4 py-1.5 rounded-full text-sm font-medium
          ${myTurn ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface)] text-[var(--text)]'}
        `}
      >
        {label}
      </div>
    </div>
  );
});
