'use client';

import { InGameAvatar } from '@/features/games/ui/InGameAvatar';
import { useCheckersTheme } from '../lib/CheckersThemeContext';
import type { CheckersPlayer } from '../types';

interface TurnBadgeProps {
  currentTurnUserId: string | null;
  players: CheckersPlayer[];
  myTurn: boolean;
  resolveName?: (id?: string | null) => string;
}

export function TurnBadge({
  currentTurnUserId,
  players,
  myTurn,
  resolveName,
}: TurnBadgeProps) {
  const theme = useCheckersTheme();
  if (!currentTurnUserId) return null;

  const player = players.find((p) => p.playerId === currentTurnUserId);
  const display =
    resolveName?.(player?.playerId) ?? player?.playerId ?? currentTurnUserId;

  return (
    <div
      className="flex flex-row py-2 px-3 rounded-[999px] border-[var(--borderColor)] self-center items-center gap-2"
      style={{
        backgroundColor: myTurn ? '#3fd386' : 'var(--backgroundHover)',
        borderWidth: myTurn ? 0 : 1,
      }}
      data-testid="checkers-turn-badge"
    >
      <InGameAvatar
        playerId={currentTurnUserId}
        name={display}
        size="sm"
        data-testid="checkers-turn-avatar"
      />
      <span
        className="font-bold"
        style={{ color: myTurn ? '#f5f7ff' : theme.textColor }}
      >
        {myTurn ? 'Your turn' : `${display}'s turn`}
      </span>
    </div>
  );
}
