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
      <div
        data-testid="sea-battle-grids-container"
        className="sb-grids-container-mobile"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: '100%',
          paddingTop: 4,
          paddingLeft: 4,
          paddingRight: 4,
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      data-testid="sea-battle-grids-container"
      className="sb-grids-container"
      style={{
        display: 'grid',
        gridTemplateColumns:
          media.gtLg && !media.short
            ? 'repeat(3, minmax(0, 1fr))'
            : (media.tablet && media.short) ||
                (media.sm && media.gtXs) ||
                media.gtSm
              ? 'repeat(2, minmax(0, 1fr))'
              : '1fr',
        gridAutoRows: 'min-content',
        gap: media.short ? 10 : media.sm ? 12 : 16,
        width: '100%',
        minWidth: 0,
        maxWidth: media.short ? 1000 : '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: media.short ? 4 : media.sm ? 4 : 8,
        boxSizing: 'border-box',
        alignItems: 'stretch',
        justifyItems: 'center',
        alignContent: 'center',
        flexGrow: 1,
      }}
    >
      {children}
    </div>
  );
}
