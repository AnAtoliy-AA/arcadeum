"use client";

import React from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import type { GameMetadata } from "../types";

interface GameCardProps {
  game: GameMetadata;
  className?: string;
  onClick?: () => void;
  showDetails?: boolean;
  disabled?: boolean;
}

const Card = styled.div<{ $disabled?: boolean }>`
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }
  
  &:disabled {
    cursor: not-allowed;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, 
      ${({ theme, $disabled }) => $disabled ? theme.text.muted : theme.buttons.primary.gradientStart},
      ${({ theme, $disabled }) => $disabled ? theme.text.muted : theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart}
    );
  }
`;

const GameImage = styled.div<{ $thumbnail?: string }>`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: ${({ $thumbnail, theme }) => 
    $thumbnail ? `url(${$thumbnail}) center/cover` : theme.surfaces.panel.background
  };
  border: 2px solid ${({ theme }) => theme.surfaces.card.border};
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.text.muted};
  font-size: 1.5rem;
`;

const GameName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  line-height: 1.3;
`;

const GameDescription = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const GameMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const MetaTag = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.muted};
  background: ${({ theme }) => theme.surfaces.panel.background};
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
`;

const GameTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
`;

const Tag = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.text.muted};
  background: ${({ theme }) => theme.buttons.secondary.background};
  padding: 0.125rem 0.375rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
`;

const StatusIndicator = styled.div<{ $status: string }>`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  background: ${({ $status }) => {
    switch ($status) {
      case 'active': return 'rgba(34, 197, 94, 0.1)';
      case 'beta': return 'rgba(59, 130, 246, 0.1)';
      case 'experimental': return 'rgba(251, 191, 36, 0.1)';
      case 'deprecated': return 'rgba(239, 68, 68, 0.1)';
      default: return 'rgba(156, 163, 175, 0.1)';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'active': return '#22c55e';
      case 'beta': return '#3b82f6';
      case 'experimental': return '#fbbf24';
      case 'deprecated': return '#ef4444';
      default: return '#9ca3af';
    }
  }};
  border: 1px solid ${({ $status }) => {
    switch ($status) {
      case 'active': return 'rgba(34, 197, 94, 0.3)';
      case 'beta': return 'rgba(59, 130, 246, 0.3)';
      case 'experimental': return 'rgba(251, 191, 36, 0.3)';
      case 'deprecated': return 'rgba(239, 68, 68, 0.3)';
      default: return 'rgba(156, 163, 175, 0.3)';
    }
  }};
`;

export function GameCard({
  game,
  className,
  onClick,
  showDetails = false,
  disabled = false
}: GameCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    // Navigate to game room creation or game page
    router.push(`/games/${game.slug}`);
  };

  return (
    <Card 
      className={className} 
      onClick={handleClick}
      $disabled={disabled}
    >
      <StatusIndicator $status={game.status}>
        {game.status}
      </StatusIndicator>
      
      <GameImage $thumbnail={game.thumbnail}>
        {game.name.charAt(0)}
      </GameImage>
      
      <GameName>{game.name}</GameName>
      
      {showDetails && (
        <>
          <GameDescription>{game.description}</GameDescription>
          
          <GameMeta>
            <MetaTag>👥 {game.minPlayers}-{game.maxPlayers} players</MetaTag>
            {game.estimatedDuration && (
              <MetaTag>⏱️ {game.estimatedDuration} min</MetaTag>
            )}
            {game.complexity && (
              <MetaTag>🧠 {game.complexity}/5</MetaTag>
            )}
          </GameMeta>
          
          {game.tags && game.tags.length > 0 && (
            <GameTags>
              {game.tags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </GameTags>
          )}
        </>
      )}
    </Card>
  );
};