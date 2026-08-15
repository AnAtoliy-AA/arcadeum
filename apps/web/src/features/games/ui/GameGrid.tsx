import React from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
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
  ...props
}: {
  gap?: number | string;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border grid gap-5 sm:gap-4 sm:[grid-template-columns:repeat(auto-fill,minmax(240px,1fr))] max-[660px]:[grid-template-columns:1fr] [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]',
      className,
    )}
    style={gap !== undefined ? ({ gap } as CSSProperties) : undefined}
    {...props}
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
