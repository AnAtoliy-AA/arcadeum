'use client';
import { YStack, useMedia } from 'tamagui';
import type { ReactNode } from 'react';

interface SeaBattleGridsProps {
  children: ReactNode;
}

export function SeaBattleGrids({ children }: SeaBattleGridsProps) {
  const media = useMedia();
  // Only stack vertically on mobile and portrait tablet (below 800px).
  // If it's "short" (landscape mobile), we want the grid even if it's narrow.
  const isMobilePortrait = !media.gtSm && !media.short;

  if (isMobilePortrait) {
    return (
      <YStack
        gap="$4"
        width="100%"
        paddingTop="$1"
        paddingHorizontal="$1"
        alignItems="stretch"
        data-testid="sea-battle-grids-container"
      >
        {children}
      </YStack>
    );
  }

  return (
    <YStack
      data-testid="sea-battle-grids-container"
      style={{
        display: 'grid',
        gridTemplateColumns:
          (media.tablet && media.short) || (media.sm && media.gtXs)
            ? 'repeat(2, 1fr)'
            : 'repeat(auto-fit, minmax(280px, 1fr))',
      }}
      gap={media.short ? 10 : media.sm ? 12 : 16}
      width="100%"
      maxWidth={media.short ? 1000 : '100%'}
      marginHorizontal="auto"
      padding={media.short ? 4 : media.sm ? 4 : 8}
      alignItems="flex-start"
    >
      {children}
    </YStack>
  );
}
