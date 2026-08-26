'use client';

import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { GameSessionSummary, GameRoomSummary } from '@/shared/types/games';
import { Typography } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';

interface GameStatusProps {
  room: GameRoomSummary;
  session: GameSessionSummary | null;
  className?: string;
  showPlayerCount?: boolean;
  showGameTime?: boolean;
}

const StatusContainer = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-row items-center gap-3 px-4 py-3 bg-[var(--background)] rounded-[8px] border border-[var(--borderColor)]',
      className,
    )}
  >
    {children}
  </div>
);

const StatusItem = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div className={cx('flex flex-row items-center gap-1', className)}>
    {children}
  </div>
);

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
        <Typography className={'text-[14px]'}>{getStatusIcon()}</Typography>
        <Typography className={'text-[14px] font-medium'}>
          {getStatusText()}
        </Typography>
      </StatusItem>

      {showPlayerCount && (
        <StatusItem>
          <Typography className={'text-[14px]'}>👥</Typography>
          <Typography
            className={'text-[14px] font-semibold text-[var(--color)]'}
          >
            {room.playerCount} / {room.maxPlayers}
          </Typography>
          <Typography className={'text-[14px] font-medium'}>players</Typography>
        </StatusItem>
      )}

      {session && showGameTime && (
        <StatusItem>
          <Typography className={'text-[14px]'}>⏱️</Typography>
          <Typography className={'text-[14px] font-medium'}>
            {formatTime(elapsedTime)}
          </Typography>
        </StatusItem>
      )}
    </StatusContainer>
  );
}
