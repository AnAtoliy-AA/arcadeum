"use client";

import React from "react";
import styled from "styled-components";
import { GameCard } from "./GameCard";
import type { GameMetadata } from "../types";

interface GameGridProps {
  games: GameMetadata[];
  className?: string;
  columns?: number;
  gap?: string;
  showDetails?: boolean;
  onGameClick?: (game: GameMetadata) => void;
  disabledGames?: string[];
}

const Grid = styled.div<{ $columns?: number; $gap?: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ $gap }) => $gap || "1.5rem"};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export function GameGrid({ 
  games, 
  className, 
  columns, 
  gap, 
  showDetails = false, 
  onGameClick,
  disabledGames = []
}: GameGridProps) {
  return (
    <Grid 
      className={className} 
      $columns={columns} 
      $gap={gap}
    >
      {games.map(game => (
        <GameCard
          key={game.slug}
          game={game}
          showDetails={showDetails}
          disabled={disabledGames.includes(game.slug)}
          onClick={() => onGameClick?.(game)}
        />
      ))}
    </Grid>
  );
}