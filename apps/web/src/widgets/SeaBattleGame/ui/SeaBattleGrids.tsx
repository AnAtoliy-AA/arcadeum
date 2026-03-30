'use client';
import { XStack } from 'tamagui';
import type { ReactNode } from 'react';

interface SeaBattleGridsProps {
  children: ReactNode;
}

export function SeaBattleGrids({ children }: SeaBattleGridsProps) {
  return (
    <XStack
      flexWrap="wrap"
      gap="$8"
      width="100%"
      paddingVertical="$4"
      paddingHorizontal="$2"
      data-testid="sea-battle-grids-container"
      $md={{ flexDirection: 'column', gap: '$4', alignItems: 'center' }}
      $sm={{ flexDirection: 'column', gap: '$4', alignItems: 'center' }}
    >
      {children}
    </XStack>
  );
}
