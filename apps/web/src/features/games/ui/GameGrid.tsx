import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { GameCard } from './GameCard';
import type { GameMetadata } from '../types';
import { cx } from '@arcadeum/ui/utils/cx';

interface GameGridProps {
  games: GameMetadata[];
  className?: string;
  gap?: number | string;
  showDetails?: boolean;
  onGameClick?: (game: GameMetadata) => void;
  disabledGames?: string[];
}

const GridContainer = ({
  gap,
  className,
  children,
}: {
  gap?: number | string;
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'grid gap-5 sm:gap-4 sm:[grid-template-columns:repeat(auto-fill,minmax(240px,1fr))] max-[660px]:[grid-template-columns:1fr] [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]',
      className,
    )}
    style={gap !== undefined ? ({ gap } as CSSProperties) : undefined}
  >
    {children}
  </div>
);

export function GameGrid({
  games,
  className,
  gap,
  showDetails = false,
  onGameClick,
  disabledGames = [],
}: GameGridProps) {
  return (
    <GridContainer className={className} gap={gap}>
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
