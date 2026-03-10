'use client';

import React from 'react';
import { GridsContainer } from './styles';

interface SeaBattleGridsProps {
  children: React.ReactNode;
}

export function SeaBattleGrids({ children }: SeaBattleGridsProps) {
  return (
    <GridsContainer data-testid="sea-battle-grids-container">
      {children}
    </GridsContainer>
  );
}
