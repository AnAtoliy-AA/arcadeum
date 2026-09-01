'use client';

import { InGameAvatar } from '@/features/games/ui/InGameAvatar';
import { useTicTacToeTheme } from '../lib/TicTacToeThemeContext';
import type { TicTacToePlayer, TicTacToeTeam } from '../types';

interface TurnBadgeProps {
  currentEntryId: string | null;
  currentShooterId: string | null;
  teamMode: boolean;
  players: TicTacToePlayer[];
  teams: TicTacToeTeam[];
  myTurn: boolean;
  resolveName?: (id?: string | null) => string;
}

export function TurnBadge({
  currentEntryId,
  currentShooterId,
  teamMode,
  players,
  teams,
  myTurn,
  resolveName,
}: TurnBadgeProps) {
  const theme = useTicTacToeTheme();
  if (!currentEntryId) return null;

  const display = (() => {
    if (teamMode) {
      const team = teams.find((t) => t.id === currentEntryId);
      const shooter = currentShooterId
        ? (resolveName?.(currentShooterId) ?? currentShooterId)
        : '';
      return team ? `${team.name}${shooter ? ` — ${shooter}` : ''}` : shooter;
    }
    const player = players.find((p) => p.playerId === currentEntryId);
    return (
      resolveName?.(player?.playerId) ?? player?.playerId ?? currentEntryId
    );
  })();

  // The actual person on the clock: in team mode that's the shooter, otherwise
  // the current entry (which is the player id). Drives the equipped avatar.
  const shooterId = teamMode ? currentShooterId : currentEntryId;

  return (
    <div
      className="flex flex-row py-2 px-3 rounded-[999px] border-[var(--borderColor)] self-center items-center gap-2"
      style={{
        backgroundColor: myTurn ? '#3fd386' : 'var(--backgroundHover)',
        borderWidth: myTurn ? 0 : 1,
      }}
      data-testid="ttt-turn-badge"
    >
      {shooterId ? (
        <InGameAvatar
          playerId={shooterId}
          name={display}
          size="sm"
          data-testid="ttt-turn-avatar"
        />
      ) : null}
      <span
        className="font-bold"
        style={{
          color: myTurn ? '#f5f7ff' : theme.textColor,
        }}
      >
        {myTurn ? 'Your turn' : `${display}'s turn`}
      </span>
    </div>
  );
}
