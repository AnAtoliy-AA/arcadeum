"use client";

import React from "react";
import styled from "styled-components";
import { GamesControlPanel } from "@/widgets/GamesControlPanel";

interface GameLayoutProps {
  children: React.ReactNode;
  className?: string;
  showControls?: boolean;
  onFullscreenToggle?: () => void;
  onLeaveGame?: () => void;
  fullscreen?: boolean;
}

const Container = styled.div<{ $fullscreen?: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
  position: relative;
  border-radius: ${({ $fullscreen }) => ($fullscreen ? "0" : "16px")};
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  box-shadow: ${({ $fullscreen }) => 
    $fullscreen ? "none" : "0 8px 32px rgba(0, 0, 0, 0.12)"
  };
  overflow: hidden;

  /* Fullscreen styles */
  ${({ $fullscreen }) => 
    $fullscreen && `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 9999 !important;
      padding: 1rem !important;
      gap: 1rem !important;
    `
  }

  @media (max-width: 768px) {
    min-height: 500px;
    gap: 1rem;
    padding: 1rem;
  }
`;

const GameContent = styled.main`
  flex: 1;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
`;

export function GameLayout({
  children,
  className,
  showControls = true,
  onFullscreenToggle: _onFullscreenToggle,
  onLeaveGame: _onLeaveGame,
  fullscreen
}: GameLayoutProps) {
  return (
    <Container className={className} $fullscreen={fullscreen}>
      {showControls && (
        <GamesControlPanel />
      )}
      
      <GameContent>
        {children}
      </GameContent>
    </Container>
  );
}