'use client';
import { Children, useEffect, useRef, useState, type ReactNode } from 'react';
import { useMedia } from 'tamagui';

interface SeaBattleGridsProps {
  children: ReactNode;
}

const MIN_BOARD_WIDTH_DESKTOP = 200;
// Slightly tighter than desktop so phones / small tablets in landscape can
// still guarantee two boards side by side even on the narrower viewports.
const MIN_BOARD_WIDTH_MOBILE_LANDSCAPE = 200;

function idealCols(count: number): number {
  if (count <= 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4; // 4–8 → 4 wide so the layout never needs more than two rows
}

/**
 * Picks the column count for the boards grid and lets pure CSS handle
 * sizing each board:
 *   - mobile portrait (narrow & not landscape): 1 column, full-width boards
 *     stacked vertically (page scrolls naturally if there are many).
 *   - any landscape on phones / small tablets: at least 2 columns.
 *   - tablet+ desktop: balanced layout from idealCols().
 *
 * For >1 column layouts, the grid uses `repeat(M, minmax(0, 1fr))` rows
 * + `repeat(N, minmax(0, 1fr))` cols, the ancestor flex chain provides a
 * definite height (SharedGameBoard / MainGameArea are flex:1 minHeight:0),
 * and the BoardGrid inside uses `aspect-ratio: 1` + `width: min(100%,
 * 100cqh - chrome)` to be the largest square that fits its cell. The
 * effect is "boards grow to fill the available space without scroll" —
 * no JS measurement needed.
 */
export function SeaBattleGrids({ children }: SeaBattleGridsProps) {
  const media = useMedia();
  // `Children.count` includes booleans / nulls from `{cond && ...}`
  // expressions, which inflates the row count when callers conditionally
  // render the current-player board. `Children.toArray` drops those.
  const count = Children.toArray(children).length;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isLandscape, setIsLandscape] = useState(false);
  // Watches for an ancestor with `.is-fullscreen` (added by the page-level
  // or widget-level useFullscreen hook). When set, the grid caps cols at 2
  // so the player can see two full boards at once and scroll through the
  // rest vertically — the preferred interaction in the expanded view.
  const [isAncestorFullscreen, setIsAncestorFullscreen] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setContainerWidth(rect.width);
    setContainerHeight(rect.height);
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
        setContainerHeight(entry.contentRect.height);
      }
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setIsLandscape(window.innerWidth > window.innerHeight);
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const check = () => {
      let el: HTMLElement | null = node.parentElement;
      while (el) {
        if (el.classList.contains('is-fullscreen')) {
          setIsAncestorFullscreen(true);
          return;
        }
        el = el.parentElement;
      }
      setIsAncestorFullscreen(false);
    };
    check();
    const observer = new MutationObserver(check);
    let el: HTMLElement | null = node.parentElement;
    while (el) {
      observer.observe(el, { attributes: true, attributeFilter: ['class'] });
      el = el.parentElement;
    }
    return () => observer.disconnect();
  }, []);

  const isCompact = !media.gtSm; // phone / small-tablet widths
  const isMobilePortrait = isCompact && !media.short && !isLandscape;
  // Side-layout (ships on the LEFT of the board) is enabled when:
  //   • mobile / small-tablet in landscape — the original case, where
  //     vertical space is scarce.
  //   • OR the grid is "height-tight": each cell ends up taller than
  //     wide enough that side-layout would give a bigger board (less
  //     vertical chrome 42 vs 115 outweighs the 47px horizontal cost
  //     of the ships column). Common in widget-fullscreen with many
  //     boards on a wide-but-not-tall desktop viewport.
  const isMobileLandscape = !media.gtMd && isLandscape;

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
    const ideal = idealCols(count);
    const fits = Math.max(
      1,
      Math.floor(containerWidth / MIN_BOARD_WIDTH_DESKTOP),
    );
    cols = Math.min(ideal, count, fits || ideal);
  }

  // Cap at 2 cols whenever there isn't real desktop-wide room: mobile
  // / tablet held sideways (any width ≤1150px in landscape) OR a
  // mobile / tablet fullscreen. On desktop (>1150px) fullscreen, we
  // keep the balanced idealCols layout so all boards stay visible at
  // once — the player explicitly expanded to see *more*, not pages.
  const wantsTwoColCap = !media.gtMd && (isAncestorFullscreen || isLandscape);
  if (wantsTwoColCap && cols > 2) {
    cols = 2;
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

  const rows = Math.ceil(count / cols);
  const rowGap = media.short ? 10 : media.sm ? 12 : 16;
  const gridPadding = media.short ? 4 : media.sm ? 4 : 8;
  // Cap every row at "exactly a square cell + chrome". The board is sized
  // to the SHORTER of width/height inside its section, so a row taller
  // than (cellWidth + chrome) just leaves a void below the last cell —
  // the cells can't grow into it because they're width-limited. Sizing
  // rows directly (no `1fr` stretch) tightens each section around its
  // board.
  const approxCellWidthPx = Math.max(
    0,
    (containerWidth - gridPadding * 2 - rowGap * (cols - 1)) / cols,
  );
  // Fit-cap = (containerHeight - row gaps) / rows. Shrinks the row
  // just enough so every row fits in the grid container without
  // forcing a scroll (e.g. desktop fullscreen with 8 boards in 4×2).
  const SAFETY_MIN_ROW_PX = 160;
  const fitCapPx = containerHeight > 0
    ? Math.max(
        SAFETY_MIN_ROW_PX,
        Math.floor((containerHeight - rowGap * (rows - 1)) / rows),
      )
    : 0;
  // Side layout wins when the row is short enough that top-layout's
  // 115px vertical chrome would crush the board below what side-
  // layout's smaller 42px chrome + 55px horizontal cost can offer.
  // Algebra: side wins iff (cqi - 55, cqh - 42) is bigger than
  // (cqi - 8, cqh - 115); under height-limited (cqh small) cases,
  // that reduces to `cqh < cqi + 18`. Approximate with row & cell width.
  const isHeightTight =
    fitCapPx > 0 && approxCellWidthPx > 0 && fitCapPx < approxCellWidthPx + 18;
  const useSideLayout = isMobileLandscape || isHeightTight;
  // Chrome budget = the section's non-board axis. Side layout: 42v + 55h.
  // Top layout: 115v + 8h. The square-cell row works out to
  //  top:  cellWidth + 115
  //  side: cellWidth - 13   (= cellWidth - 55 + 42)
  const squareRowHeightPx = Math.round(
    useSideLayout ? approxCellWidthPx - 13 : approxCellWidthPx + 115,
  );
  // clamp(floor, square-row, fit-cap):
  // - middle term tightens the row around an exact square cell so the
  //   section never renders a void below a width-limited board.
  // - floor keeps cells playable on roomy viewports; when the
  //   container is genuinely short, we let the floor drop to fit-cap
  //   (down to a safety minimum) so all rows stay visible.
  const idealFloorPx = wantsTwoColCap
    ? 320
    : media.short
      ? 220
      : isCompact
        ? 260
        : 300;
  const rowFloorPx = fitCapPx > 0 ? Math.min(idealFloorPx, fitCapPx) : idealFloorPx;
  const fitCap = fitCapPx > 0 ? `${fitCapPx}px` : '78dvh';
  const rowHeight = `clamp(${rowFloorPx}px, ${squareRowHeightPx}px, ${fitCap})`;

  return (
    <div
      ref={containerRef}
      data-testid="sea-battle-grids-container"
      className={`sb-grids-container sb-fit-grid${
        useSideLayout ? ' sb-mobile-landscape' : ''
      }`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, ${rowHeight})`,
        gap: rowGap,
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        padding: media.short ? 4 : media.sm ? 4 : 8,
        boxSizing: 'border-box',
        // Anchor tracks to the top. We previously used `place-content:
        // center` here, but when content (rows × rowHeight) exceeds the
        // grid container, centering pushes the first row ABOVE the
        // container top — where the widget's sticky header crops it.
        // Top-aligned: extras live below and scroll into view naturally.
        // Horizontally, `center` keeps the boards centered when they
        // don't fill the row.
        alignContent: 'start',
        justifyContent: 'center',
        flex: 1,
      }}
    >
      {children}
    </div>
  );
}
