import React from 'react';
import { styled, YStack, XStack } from 'tamagui';
import type { GameSessionSummary } from '@/shared/types/games';
import { Card, Badge, Avatar, Typography } from '@arcadeum/ui';

interface PlayerListProps {
  session: GameSessionSummary | null;
  currentUserId?: string | null;
  className?: string;
  showStatus?: boolean;
  showScore?: boolean;
  onPlayerAction?: (playerId: string, action: string) => void;
}

const List = styled(YStack, {
  name: 'PlayerList',
  gap: '$2',
  maxHeight: 300,
  overflowY: 'auto',
});

const StyledPlayerItem = styled(Card, {
  name: 'PlayerItem',
  flexDirection: 'row',
  alignItems: 'center',
  padding: 'sm',
  cursor: 'pointer',
  borderWidth: 1,

  hoverStyle: {
    x: 2,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowRadius: 8,
  },

  variants: {
    $isCurrent: {
      true: {
        background:
          'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(29, 78, 216, 0.12))',
        borderColor: '$primary',
      },
      false: {
        backgroundColor: '$background',
        borderColor: '$borderColor',
      },
    },
    $isHost: {
      true: {
        borderColor: '#10b981',
      },
    },
  } as const,
});

const StatusIndicator = styled(YStack, {
  width: 8,
  height: 8,
  borderRadius: 4,
  variants: {
    status: {
      active: { backgroundColor: '#10b981' },
      inactive: { backgroundColor: '#6b7280' },
      away: { backgroundColor: '#f59e0b' },
      offline: { backgroundColor: '#6b7280' },
    },
  } as const,
});

export function PlayerList({
  session,
  currentUserId,
  className,
  showStatus = true,
  showScore = false,
  onPlayerAction,
}: PlayerListProps) {
  if (!session) {
    return (
      <List className={className}>
        <StyledPlayerItem>
          <Avatar name="?" size="sm" />
          <YStack flex={1} marginLeft="$3">
            <Typography fontWeight="600" fontSize="$2">
              No players
            </Typography>
          </YStack>
        </StyledPlayerItem>
      </List>
    );
  }

  // Sample data kept for logic consistency
  const players = [
    {
      id: 'player1',
      name: 'Player 1',
      isHost: true,
      status: 'active' as const,
      score: 0,
      isCurrent: currentUserId === 'player1',
    },
    {
      id: 'player2',
      name: 'Player 2',
      isHost: false,
      status: 'active' as const,
      score: 0,
      isCurrent: currentUserId === 'player2',
    },
  ];

  return (
    <List className={className}>
      {players.map((player) => (
        <StyledPlayerItem
          key={player.id}
          $isCurrent={player.isCurrent}
          $isHost={player.isHost}
          onClick={() => onPlayerAction?.(player.id, 'info')}
        >
          <Avatar
            name={player.name}
            size="sm"
            {...(player.isHost
              ? {
                  backgroundColor: '#10b981',
                }
              : {})}
          />

          <YStack flex={1} marginLeft="$3">
            <XStack alignItems="center" gap="$2" marginBottom="$1">
              <Typography
                fontWeight="600"
                fontSize="$2"
                ellipsizeMode="tail"
                numberOfLines={1}
              >
                {player.name}
              </Typography>
              {player.isHost && (
                <Badge variant="success" size="sm">
                  Host
                </Badge>
              )}
            </XStack>

            <XStack alignItems="center" gap="$2">
              {showStatus && <StatusIndicator status={player.status} />}
              {showScore && (
                <Typography fontSize="$1" color="$textSecondary">
                  {player.score} pts
                </Typography>
              )}
            </XStack>
          </YStack>
        </StyledPlayerItem>
      ))}
    </List>
  );
}
