import React from 'react';
import { styled, YStack } from 'tamagui';
import { GameCard } from './GameCard';
import type { GameMetadata } from '../types';

interface GameGridProps {
  games: GameMetadata[];
  className?: string;
  gap?: number | string;
  showDetails?: boolean;
  onGameClick?: (game: GameMetadata) => void;
  disabledGames?: string[];
}

const GridContainer = styled(YStack, {
  name: 'GameGrid',
  display: 'grid' as unknown as 'flex',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '$5',

  $gtSm: {
    gap: '$4',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  },

  $xs: {
    gridTemplateColumns: '1fr',
  },
});

export function GameGrid({
  games,
  className,
  gap,
  showDetails = false,
  onGameClick,
  disabledGames = [],
}: GameGridProps) {
  return (
    <GridContainer className={className} {...(gap ? { gap } : {})}>
      {games.map((game) => (
        <GameCard
          key={game.slug}
          game={game}
          showDetails={showDetails}
          disabled={disabledGames.includes(game.slug)}
          onClick={() => onGameClick?.(game)}
        />
      ))}
    </GridContainer>
  );
}
