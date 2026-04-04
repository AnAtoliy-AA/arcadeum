'use client';
import { XStack, useMedia } from 'tamagui';
import type { ReactNode } from 'react';

interface SeaBattleGridsProps {
  children: ReactNode;
}

export function SeaBattleGrids({ children }: SeaBattleGridsProps) {
  const media = useMedia();
  const isNarrow = !media.gtMd;

  if (isNarrow) {
    return (
      <XStack
        flexDirection="column"
        flexWrap="nowrap"
        gap="$8"
        width="100%"
        paddingTop="$2"
        paddingHorizontal="$2"
        alignItems="stretch"
        data-testid="sea-battle-grids-container"
      >
        {children}
      </XStack>
    );
  }

  return (
    <XStack
      flexDirection="row"
      flexWrap="wrap"
      gap="$8"
      width="100%"
      flex={1}
      paddingHorizontal="$2"
      alignItems="flex-start"
      justifyContent="center"
      data-testid="sea-battle-grids-container"
    >
      {children}
    </XStack>
  );
}
