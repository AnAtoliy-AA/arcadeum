'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  min-height: 600px;
  position: relative;

  /* Fullscreen styles */
  &:fullscreen,
  &:-webkit-full-screen,
  &:-moz-full-screen {
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    border-radius: 0;
    padding: 1rem;
    gap: 1rem;
  }

  @media (max-width: 768px) {
    gap: 1rem;
    padding: 1rem;
  }
`;

const GameArea = styled.div`
  flex: 1;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;

  /* Fullscreen optimizations */
  &:fullscreen,
  &:-webkit-full-screen,
  &:-moz-full-screen {
    border-radius: 0;
    border: none;
  }
`;

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
  const [_isFullscreen, setIsFullscreen] = useState(false);

  const _handleFullscreenToggle = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <Container ref={containerRef} className={className}>
      <GamesControlPanel roomId={roomId} />
      <GameArea>{children}</GameArea>
    </Container>
  );
}
