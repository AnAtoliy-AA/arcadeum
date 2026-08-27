'use client';

import { InGameAvatar } from '@/features/games/ui';
import { useBackgammonTheme } from '../lib/BackgammonThemeContext';
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
  const theme = useBackgammonTheme();
  if (!currentTurnUserId) return null;

  const player = players.find((p) => p.playerId === currentTurnUserId);
  const display =
    resolveName?.(player?.playerId) ?? player?.playerId ?? currentTurnUserId;

  return (
    <div
      className={`flex flex-row py-2 px-3 rounded-full self-center items-center gap-2 border ${
        myTurn
          ? 'bg-emerald-500 text-white border-transparent'
          : 'bg-[var(--backgroundHover)] border-[var(--borderColor)]'
      }`}
      data-testid="backgammon-turn-badge"
    >
      <InGameAvatar
        data-testid="backgammon-turn-avatar"
        name={display}
        playerId={currentTurnUserId}
        size="sm"
      />
      <span
        className="font-bold text-sm"
        style={{ color: myTurn ? '#ffffff' : theme.textColor }}
      >
        {myTurn ? 'Your turn' : `${display}'s turn`}
      </span>
    </div>
  );
}
