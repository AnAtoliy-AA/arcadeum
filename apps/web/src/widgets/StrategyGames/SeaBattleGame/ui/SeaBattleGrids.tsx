import type { ReactNode } from 'react';

interface SeaBattleGridsProps {
  children: ReactNode;
}

/**
 * Pure CSS Flex & Grid layout container.
 * Displays as many board fields per row as possible without shrinking
 * board cells below minimum legible sizes (e.g. 20px per cell).
 */
export function SeaBattleGrids({ children }: SeaBattleGridsProps) {
  return (
    <div
      className="sb-grids-container"
      data-testid="sea-battle-grids-container"
    >
      {children}
    </div>
  );
}
