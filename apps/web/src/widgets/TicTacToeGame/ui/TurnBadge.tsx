'use client';

import { XStack, Text } from 'tamagui';
import { InGameAvatar } from '@/features/games/ui';
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
    <XStack
      data-testid="ttt-turn-badge"
      paddingVertical="$2"
      paddingHorizontal="$3"
      borderRadius={999}
      backgroundColor={myTurn ? '$green5' : '$backgroundHover'}
      alignSelf="center"
      alignItems="center"
      gap="$2"
    >
      {shooterId ? (
        <InGameAvatar
          playerId={shooterId}
          name={display}
          size="sm"
          data-testid="ttt-turn-avatar"
        />
      ) : null}
      <Text fontWeight="700" color={theme.textColor}>
        {myTurn ? 'Your turn' : `${display}'s turn`}
      </Text>
    </XStack>
  );
}
