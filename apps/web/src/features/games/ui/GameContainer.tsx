'use client';

import React, { forwardRef, useRef, useState, useEffect } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { GamesControlPanel } from '@/widgets/GamesControlPanel';
import type { GameRoomSummary, GameSessionSummary } from '@/shared/types/games';
import { cx } from '@arcadeum/ui/utils/cx';

interface GameContainerProps {
  room: GameRoomSummary;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  isHost: boolean;
  children: React.ReactNode;
  roomId: string;
  className?: string;
}

const Container = forwardRef<
  HTMLDivElement,
  {
    isFullscreen?: boolean;
    className?: string;
    children?: ReactNode;
  } & HTMLAttributes<HTMLDivElement>
>(function Container(
  { isFullscreen = false, className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(
        'flex flex-col h-full min-h-[600px] relative',
        isFullscreen
          ? 'fixed top-0 left-0 h-screen w-screen z-[500] rounded-none p-4 gap-4 bg-[var(--background)]'
          : 'gap-5 md:p-5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

const GameArea = ({
  isFullscreen = false,
  className,
  children,
  ...props
}: {
  isFullscreen?: boolean;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'flex flex-col items-stretch flex-1 rounded-[16px] border border-[var(--borderColor)] bg-[var(--background)] overflow-hidden relative',
      isFullscreen && 'rounded-none border-0',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export function GameContainer({
  room: _room,
  session: _session,
  currentUserId: _currentUserId,
  isHost: _isHost,
  children,
  roomId,
  className,
}: GameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <Container
      ref={containerRef}
      className={className}
      isFullscreen={isFullscreen}
    >
      <GamesControlPanel roomId={roomId} />
      <GameArea isFullscreen={isFullscreen}>{children}</GameArea>
    </Container>
  );
}
