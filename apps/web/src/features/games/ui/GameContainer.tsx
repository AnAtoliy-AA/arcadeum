'use client';

import React, { useRef, useState, useEffect } from 'react';
import { styled, YStack } from 'tamagui';
import { GamesControlPanel } from '@/widgets/GamesControlPanel';
import type { GameRoomSummary, GameSessionSummary } from '@/shared/types/games';

interface GameContainerProps {
  room: GameRoomSummary;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  isHost: boolean;
  children: React.ReactNode;
  roomId: string;
  className?: string;
}

const StyledContainer = styled(YStack, {
  name: 'GameContainer',
  gap: '$5',
  height: '100%',
  minHeight: 600,
  position: 'relative',

  // responsive
  $gtSm: {
    padding: '$5',
    gap: '$5',
  },

  variants: {
    isFullscreen: {
      true: {
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: '$5',
        borderRadius: 0,
        padding: '$4',
        gap: '$4',
        backgroundColor: '$background',
      },
    },
  } as const,
});

const StyledGameArea = styled(YStack, {
  name: 'GameArea',
  flex: 1,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$background',
  overflow: 'hidden',
  position: 'relative',

  variants: {
    isFullscreen: {
      true: {
        borderRadius: 0,
        borderWidth: 0,
      },
    },
  } as const,
});

export function GameContainer({
  room: _room,
  session: _session,
  currentUserId: _currentUserId,
  isHost: _isHost,
  children,
  roomId,
  className,
}: GameContainerProps) {
  const containerRef = useRef<React.ElementRef<typeof StyledContainer>>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <StyledContainer
      ref={containerRef}
      className={className}
      isFullscreen={isFullscreen}
    >
      <GamesControlPanel roomId={roomId} />
      <StyledGameArea isFullscreen={isFullscreen}>{children}</StyledGameArea>
    </StyledContainer>
  );
}
