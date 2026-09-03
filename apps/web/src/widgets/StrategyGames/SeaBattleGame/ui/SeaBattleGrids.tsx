import type { ReactNode } from 'react';

interface SeaBattleGridsProps {
  children: ReactNode;
}

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
