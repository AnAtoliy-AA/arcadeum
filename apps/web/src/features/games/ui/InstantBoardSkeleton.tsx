import React from 'react';

export interface InstantBoardSkeletonProps {
  gameId?: string;
  gridSize?: number;
  className?: string;
}

export function InstantBoardSkeleton({
  gameId = 'default',
  gridSize = 8,
  className = '',
}: InstantBoardSkeletonProps) {
  const isGridGame = [
    'chess',
    'checkers',
    'sea-battle',
    'tic-tac-toe',
    'go',
    'minesweeper',
  ].includes(gameId);
  const cellsCount = isGridGame
    ? gameId === 'tic-tac-toe'
      ? 9
      : gridSize * gridSize
    : 16;
  const columns = gameId === 'tic-tac-toe' ? 3 : gridSize;

  const getGridClass = (cols: number) => {
    switch (cols) {
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      case 6:
        return 'grid-cols-6';
      case 10:
        return 'grid-cols-10';
      case 8:
      default:
        return 'grid-cols-8';
    }
  };

  return (
    <div
      data-testid="instant-board-skeleton"
      className={`relative w-full max-w-2xl mx-auto aspect-square rounded-2xl bg-surface/50 border border-border/40 backdrop-blur-md p-4 flex flex-col items-center justify-center animate-pulse overflow-hidden ${className}`}
    >
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-surface-elevated/70" />
          <div className="w-24 h-4 rounded-md bg-surface-elevated/60" />
        </div>
        <div className="w-16 h-6 rounded-full bg-surface-elevated/50" />
      </div>

      <div
        className={`w-full flex-1 grid ${getGridClass(columns)} gap-1.5 p-2 rounded-xl bg-surface-subtle/30`}
      >
        {Array.from({ length: cellsCount }).map((_, index) => (
          <div
            key={index}
            className="w-full aspect-square rounded-lg bg-surface-elevated/40"
          />
        ))}
      </div>

      <div className="w-full flex items-center justify-between pt-3 mt-3 border-t border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-surface-elevated/70" />
          <div className="w-24 h-4 rounded-md bg-surface-elevated/60" />
        </div>
        <div className="w-20 h-8 rounded-lg bg-surface-elevated/50" />
      </div>
    </div>
  );
}
