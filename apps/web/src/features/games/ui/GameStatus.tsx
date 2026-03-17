'use client';

import React, { useState, useEffect } from 'react';
import { styled, XStack } from 'tamagui';
import type { GameSessionSummary, GameRoomSummary } from '@/shared/types/games';
import { Typography } from '@arcadeum/ui';

interface GameStatusProps {
  room: GameRoomSummary;
  session: GameSessionSummary | null;
  className?: string;
  showPlayerCount?: boolean;
  showGameTime?: boolean;
}

const StatusContainer = styled(XStack, {
  name: 'GameStatus',
  alignItems: 'center',
  gap: '$3',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  backgroundColor: '$background',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '$borderColor',
});

const StatusItem = styled(XStack, {
  name: 'StatusItem',
  alignItems: 'center',
  gap: '$1',
});

export function GameStatus({
  room,
  session,
  className,
  showPlayerCount = true,
  showGameTime = true,
}: GameStatusProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (session?.status === 'active') {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [session?.status]);

  const getStatusIcon = () => {
    if (!session) return '⏳';
    switch (session.status) {
      case 'waiting':
        return '⏳';
      case 'active':
        return '🎮';
      case 'completed':
        return '✅';
      default:
        return '⏳';
    }
  };

  const getStatusText = () => {
    if (!session) return 'Waiting for players';
    switch (session.status) {
      case 'waiting':
        return 'Waiting to start';
      case 'active':
        return 'Game in progress';
      case 'completed':
        return 'Game completed';
      default:
        return 'Game active';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <StatusContainer className={className}>
      <StatusItem>
        <Typography fontSize="$2">{getStatusIcon()}</Typography>
        <Typography fontSize="$2" fontWeight="500">
          {getStatusText()}
        </Typography>
      </StatusItem>

      {showPlayerCount && (
        <StatusItem>
          <Typography fontSize="$2">👥</Typography>
          <Typography fontSize="$2" fontWeight="600" color="$color">
            {room.playerCount} / {room.maxPlayers}
          </Typography>
          <Typography fontSize="$2" fontWeight="500">
            players
          </Typography>
        </StatusItem>
      )}

      {session && showGameTime && (
        <StatusItem>
          <Typography fontSize="$2">⏱️</Typography>
          <Typography fontSize="$2" fontWeight="500">
            {formatTime(elapsedTime)}
          </Typography>
        </StatusItem>
      )}
    </StatusContainer>
  );
}
