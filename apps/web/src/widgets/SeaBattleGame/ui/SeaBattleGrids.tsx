'use client';
import { Children, type ReactNode } from 'react';
import { useMedia } from 'tamagui';

interface SeaBattleGridsProps {
  children: ReactNode;
}

/**
 * Picks the column count for the boards grid:
 *   - mobile portrait (narrow & not "short"): 1 column (one board per row)
 *   - mobile landscape ("short" viewport): 2 columns
 *   - tablet+: as big as possible while keeping the last row full when
 *     possible. Prefers a balanced layout over taller stacks for common
 *     counts (2,4,6,8 fit perfectly; 3/5/7 leave one trailing empty cell).
 */
function pickColumns(
  count: number,
  isMobilePortrait: boolean,
  isShort: boolean,
): number {
  if (count <= 1) return 1;
  if (isMobilePortrait) return 1;
  if (isShort) return Math.min(2, count);
  if (count === 2) return 2;
  if (count === 3) return 3;
  if (count <= 4) return 2; // 2x2
  if (count <= 6) return 3; // 3xN
  return 4; // up to 8 → 4 wide
}

export function SeaBattleGrids({ children }: SeaBattleGridsProps) {
  const media = useMedia();
  const isMobilePortrait = !media.gtSm && !media.short;
  const count = Children.count(children);
  const cols = pickColumns(count, isMobilePortrait, !!media.short);

  if (cols === 1) {
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
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridAutoRows: 'min-content',
        gap: media.short ? 10 : media.sm ? 12 : 16,
        width: '100%',
        minWidth: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: media.short ? 4 : media.sm ? 4 : 8,
        boxSizing: 'border-box',
        alignItems: 'stretch',
        justifyItems: 'stretch',
        alignContent: 'start',
        flexGrow: 1,
      }}
    >
      {children}
    </div>
  );
}
