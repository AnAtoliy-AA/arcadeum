'use client';

import React from 'react';
import styled from 'styled-components';
import type { GameSessionSummary } from '@/shared/types/games';
import { Card, Badge, Avatar } from '@/shared/ui';

interface PlayerListProps {
  session: GameSessionSummary | null;
  currentUserId?: string | null;
  className?: string;
  showStatus?: boolean;
  showScore?: boolean;
  maxPlayers?: number;
  onPlayerAction?: (playerId: string, action: string) => void;
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
`;

const PlayerItem = styled(Card)<{
  $isCurrent?: boolean;
  $isHost?: boolean;
  $isActive?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  background: ${({ theme, $isCurrent }) =>
    $isCurrent
      ? 'linear-gradient(135deg, #3b82f620, #1d4ed820)'
      : theme.surfaces.card.background};
  border: 1px solid
    ${({ theme, $isCurrent, $isHost }) => {
      if ($isCurrent) return '#3b82f6';
      if ($isHost) return '#10b981';
      return theme.surfaces.card.border;
    }};

  &:hover {
    transform: translateX(2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const PlayerAvatar = styled(Avatar)<{ $isHost?: boolean }>`
  background: ${({ theme, $isHost }) =>
    $isHost
      ? 'linear-gradient(135deg, #10b981, #059669)'
      : theme.buttons.secondary.background};
`;

const PlayerInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PlayerName = styled.div<{ $isCurrent?: boolean }>`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${({ theme, $isCurrent }) =>
    $isCurrent ? theme.text.primary : theme.text.primary};
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PlayerDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const StatusIndicator = styled.span<{ $status: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $status }) => {
    switch ($status) {
      case 'active':
        return '#10b981';
      case 'inactive':
        return '#6b7280';
      case 'away':
        return '#f59e0b';
      case 'offline':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  }};
`;

const Score = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

export function PlayerList({
  session,
  currentUserId,
  className,
  showStatus = true,
  showScore = false,
  maxPlayers: _maxPlayers,
  onPlayerAction,
}: PlayerListProps) {
  if (!session) {
    return (
      <List className={className}>
        <PlayerItem>
          <Avatar name="?" size="sm" />
          <PlayerInfo>
            <PlayerName>No players</PlayerName>
          </PlayerInfo>
        </PlayerItem>
      </List>
    );
  }

  // For now, we'll create a simple player representation
  // In a real implementation, this would use actual player data from the session
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
        <PlayerItem
          key={player.id}
          $isCurrent={player.isCurrent}
          $isHost={player.isHost}
          $isActive={player.status === 'active'}
          onClick={() => onPlayerAction?.(player.id, 'info')}
        >
          <PlayerAvatar name={player.name} size="sm" $isHost={player.isHost} />

          <PlayerInfo>
            <PlayerName $isCurrent={player.isCurrent}>
              {player.name}
              {player.isHost && (
                <Badge variant="success" size="sm">
                  Host
                </Badge>
              )}
            </PlayerName>

            <PlayerDetails>
              {showStatus && <StatusIndicator $status={player.status} />}

              {showScore && <Score>{player.score} pts</Score>}
            </PlayerDetails>
          </PlayerInfo>
        </PlayerItem>
      ))}
    </List>
  );
}
