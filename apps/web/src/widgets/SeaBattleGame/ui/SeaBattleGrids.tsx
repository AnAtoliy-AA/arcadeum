'use client';
import {
  Children,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useMedia } from 'tamagui';

interface SeaBattleGridsProps {
  children: ReactNode;
}

const MIN_BOARD_WIDTH_DESKTOP = 280;
// Slightly tighter than desktop so phones / small tablets in landscape can still
// guarantee two boards side by side even on the narrower viewports.
const MIN_BOARD_WIDTH_MOBILE_LANDSCAPE = 200;
// Upper bound for a single board's width. Generous on purpose so on tall /
// fullscreen displays the boards can grow into the available space — the
// actual width is still constrained per-row by the height-driven cap below.
const MAX_BOARD_WIDTH = 720;
// Non-grid chrome inside each PlayerSection (name, ships left strip, column
// labels, paddings, badge wrapper). Used to convert "available height per row"
// into "max board side" so two rows of boards fit without scroll.
const BOARD_SECTION_CHROME_DESKTOP = 130;
const BOARD_SECTION_CHROME_COMPACT = 90;
// Bottom breathing room left under the boards so they don't kiss the
// container edge.
const BOTTOM_BREATHING_PX = 12;
// Hard floor so the board never shrinks below something playable when the
// viewport math gets aggressive (very short viewports, many rows).
const MIN_PLAYABLE_BOARD_SIDE = 200;

function idealCols(count: number): number {
  if (count <= 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4; // 4–8 → 4 wide so the layout never needs more than two rows
}

/**
 * Picks the column count and per-board size for the boards grid:
 *   - mobile portrait (narrow & not landscape): 1 column, full-width boards
 *   - any landscape on phones / small tablets: at least 2 columns, sized to
 *     fit the viewport vertically so the layout doesn't scroll
 *   - tablet+ desktop: balanced layout from idealCols(), boards expand into
 *     the actual remaining vertical space (measured from the DOM) so 2 rows
 *     still fit while reclaiming every spare pixel
 */
export function SeaBattleGrids({ children }: SeaBattleGridsProps) {
  const media = useMedia();
  const count = Children.count(children);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  // Vertical space available below the grid's top edge within the visible
  // viewport. Measured from the DOM (rather than guessed via a chrome
  // constant) so the boards fill whatever room the rest of the layout
  // happens to leave them.
  const [availableHeight, setAvailableHeight] = useState(0);
  const [isLandscape, setIsLandscape] = useState(false);

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

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      setAvailableHeight(
        Math.max(0, window.innerHeight - rect.top - BOTTOM_BREATHING_PX),
      );
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    // Capture-phase listener so scrolling any ancestor (which can shift our
    // top) re-runs the measurement.
    document.addEventListener('scroll', measure, true);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      document.removeEventListener('scroll', measure, true);
    };
  }, []);

  const isCompact = !media.gtSm; // phone / small-tablet widths
  const isMobilePortrait = isCompact && !media.short && !isLandscape;

  // Column count
  let cols: number;
  if (count <= 1 || isMobilePortrait) {
    cols = 1;
  } else if (media.short) {
    // Phone-sized landscape (very short viewport): cap at 2 cols so boards
    // stay playable when there are many players.
    const fits = Math.max(
      1,
      Math.floor(containerWidth / MIN_BOARD_WIDTH_MOBILE_LANDSCAPE),
    );
    cols = Math.min(2, count, fits || 2);
  } else if (isCompact && isLandscape) {
    // Small-tablet / narrow landscape that isn't "short" (e.g. 800×600).
    // Always at least 2 boards in a row, but otherwise use the balanced
    // desktop layout.
    const ideal = idealCols(count);
    const fits = Math.max(
      1,
      Math.floor(containerWidth / MIN_BOARD_WIDTH_MOBILE_LANDSCAPE),
    );
    cols = Math.max(2, Math.min(ideal, count, fits || 2));
  } else {
    // Tablet landscape and desktop.
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

  // Compute the height-driven cap. `availableHeight` is the actual room left
  // in the viewport below the grid's top; we divide it across however many
  // rows the layout needs and subtract per-section chrome to get the maximum
  // board side that won't trigger vertical scroll.
  const rows = Math.ceil(count / cols);
  const rowGap = media.short ? 10 : media.sm ? 12 : 16;
  const sectionChrome =
    media.short || isCompact
      ? BOARD_SECTION_CHROME_COMPACT
      : BOARD_SECTION_CHROME_DESKTOP;
  const usableHeight = Math.max(
    MIN_PLAYABLE_BOARD_SIDE * rows + rowGap * (rows - 1),
    availableHeight,
  );
  const perRowBudget = (usableHeight - rowGap * (rows - 1)) / rows;
  const heightCappedBoardSide = Math.max(
    MIN_PLAYABLE_BOARD_SIDE,
    perRowBudget - sectionChrome,
  );
  const maxBoardWidth = Math.min(MAX_BOARD_WIDTH, heightCappedBoardSide);

  // Only apply the explicit pixel cap on layouts with room to grow. On
  // phone-landscape (very short viewports) we keep 1fr tracks so boards
  // always fill the narrow viewport width.
  const useCap = !media.short;
  const gridTemplateColumns = useCap
    ? `repeat(${cols}, minmax(0, ${Math.round(maxBoardWidth)}px))`
    : `repeat(${cols}, minmax(0, 1fr))`;

  return (
    <div
      ref={containerRef}
      data-testid="sea-battle-grids-container"
      className="sb-grids-container"
      style={{
        display: 'grid',
        gridTemplateColumns,
        gridAutoRows: 'min-content',
        gap: rowGap,
        width: '100%',
        minWidth: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: media.short ? 4 : media.sm ? 4 : 8,
        boxSizing: 'border-box',
        alignItems: 'stretch',
        justifyItems: 'stretch',
        alignContent: 'start',
        // With a per-track cap, wide viewports would leave slack on the right
        // of the rightmost board. Distribute it as extra inter-board gaps so
        // the row still feels balanced.
        justifyContent: 'space-evenly',
        flexGrow: 1,
      }}
    >
      {children}
    </div>
  );
}
