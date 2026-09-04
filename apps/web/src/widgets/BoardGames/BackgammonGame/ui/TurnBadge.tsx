'use client';

import { cx } from '@arcadeum/ui/utils/cx';
import { InGameAvatar } from '@/features/games/ui/InGameAvatar';
import type { BackgammonPlayer } from '../types';

interface TurnBadgeProps {
  currentTurnUserId: string | null;
  players: BackgammonPlayer[];
  myTurn: boolean;
  resolveName?: (id?: string | null) => string;
}

export function TurnBadge({
  currentTurnUserId,
  players,
  myTurn,
  resolveName,
}: TurnBadgeProps) {
  if (!currentTurnUserId) return null;

  const player = players.find((p) => p.playerId === currentTurnUserId);
  const display =
    resolveName?.(player?.playerId) ?? player?.playerId ?? currentTurnUserId;

  return (
    <div
      className={cx(
        'flex flex-row py-2 px-3 rounded-full self-center items-center gap-2 border',
        myTurn
          ? 'bg-emerald-500 text-white border-transparent'
          : 'bg-[var(--backgroundHover)] border-[var(--borderColor)]',
      )}
      data-testid="backgammon-turn-badge"
    >
      <InGameAvatar
        data-testid="backgammon-turn-avatar"
        name={display}
        playerId={currentTurnUserId}
        size="sm"
      />
      <span
        className={cx(
          'font-bold text-sm',
          myTurn ? 'text-white' : 'text-[var(--color)]',
        )}
      >
        {myTurn ? 'Your turn' : `${display}'s turn`}
      </span>
    </div>
  );
}
