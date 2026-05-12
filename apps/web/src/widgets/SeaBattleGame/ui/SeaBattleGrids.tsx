'use client';
import { Children, useEffect, useRef, useState, type ReactNode } from 'react';
import { useMedia } from 'tamagui';

interface SeaBattleGridsProps {
  children: ReactNode;
}

const MIN_BOARD_WIDTH_DESKTOP = 280;
const MIN_BOARD_WIDTH_MOBILE_LANDSCAPE = 220;

function idealCols(count: number): number {
  if (count <= 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  if (count <= 4) return 2; // 2x2
  if (count === 5) return 3; // 3+2
  return 4; // 6–8 → 4 wide so two rows fit a desktop viewport without scroll
}

/**
 * Picks the column count for the boards grid:
 *   - mobile portrait (narrow & not "short"): 1 column
 *   - mobile landscape ("short" viewport): up to 2 columns, but no
 *     narrower than MIN_BOARD_WIDTH_MOBILE_LANDSCAPE per board
 *   - tablet+: prefer the balanced layout from idealCols(), but cap by
 *     how many MIN_BOARD_WIDTH_DESKTOP-wide boards fit in the actual
 *     container width so boards never overlap when the chat panel
 *     is open or the viewport is otherwise narrow
 */
export function SeaBattleGrids({ children }: SeaBattleGridsProps) {
  const media = useMedia();
  const isMobilePortrait = !media.gtSm && !media.short;
  const count = Children.count(children);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    setContainerWidth(node.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  let cols: number;
  if (count <= 1 || isMobilePortrait) {
    cols = 1;
  } else if (media.short) {
    const fits = Math.max(
      1,
      Math.floor(containerWidth / MIN_BOARD_WIDTH_MOBILE_LANDSCAPE),
    );
    cols = Math.min(2, count, fits);
  } else {
    const ideal = idealCols(count);
    const fits = Math.max(
      1,
      Math.floor(containerWidth / MIN_BOARD_WIDTH_DESKTOP),
    );
    cols = Math.min(ideal, count, fits || ideal);
  }

  if (cols === 1) {
    return (
      <div
        ref={containerRef}
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
      ref={containerRef}
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
