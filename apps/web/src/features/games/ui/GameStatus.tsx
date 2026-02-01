"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import type { GameSessionSummary, GameRoomSummary } from "@/shared/types/games";

interface GameStatusProps {
  room: GameRoomSummary;
  session: GameSessionSummary | null;
  className?: string;
  showPlayerCount?: boolean;
  showGameTime?: boolean;
}

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.surfaces.panel.background};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
`;

const StatusItem = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const StatusIcon = styled.span`
  font-size: 1rem;
`;

const StatusText = styled.span`
  font-weight: 500;
`;

const PlayerCount = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

export function GameStatus({
  room,
  session,
  className,
  showPlayerCount = true,
  showGameTime = true
}: GameStatusProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (session?.status === "active") {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
    // Don't reset in the effect, let it reset naturally
  }, [session?.status]);

  const getStatusIcon = () => {
    if (!session) return "⏳";
    switch (session.status) {
      case "waiting": return "⏳";
      case "active": return "🎮";
      case "completed": return "✅";
      default: return "⏳";
    }
  };

  const getStatusText = () => {
    if (!session) return "Waiting for players";
    switch (session.status) {
      case "waiting": return "Waiting to start";
      case "active": return "Game in progress";
      case "completed": return "Game completed";
      default: return "Game active";
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
        <StatusIcon>{getStatusIcon()}</StatusIcon>
        <StatusText>{getStatusText()}</StatusText>
      </StatusItem>

      {showPlayerCount && (
        <StatusItem>
          <StatusIcon>👥</StatusIcon>
          <PlayerCount>
            {room.playerCount} / {room.maxPlayers}
          </PlayerCount>
          <StatusText>players</StatusText>
        </StatusItem>
      )}

      {session && showGameTime && (
        <StatusItem>
          <StatusIcon>⏱️</StatusIcon>
          <StatusText>
            {formatTime(elapsedTime)}
          </StatusText>
        </StatusItem>
      )}
    </StatusContainer>
  );
}