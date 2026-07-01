'use client';
import { Children, useEffect, useRef, useState, type ReactNode } from 'react';
import { useMedia } from 'tamagui';

interface SeaBattleGridsProps {
  children: ReactNode;
}

// Min board width for the mobile/tablet landscape sizing path. Desktop's
// minimum is decided inline based on fit-mode state.
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
  // Widget-level fullscreen: ancestor matches `.game-widget-container.is-fullscreen`
  // (the expand button on the widget header). This is the "fit every
  // board on one screen" state and is the only state where the grid is
  // allowed to shrink cells — and only on desktop (mobile widget-fs
  // keeps cells at non-fs size per spec; scrolls if rows don't fit).
  //
  // Page-level fullscreen (games-room-container, browser F11) is
  // deliberately not tracked: cells in page-fs must not differ from
  // non-fs (page-fs is about screen real estate, not shrinking), so
  // there's nothing to react to.
  const [isWidgetFullscreen, setIsWidgetFullscreen] = useState(false);

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
      let widgetFs = false;
      let el: HTMLElement | null = node.parentElement;
      while (el) {
        if (
          el.classList.contains('is-fullscreen') &&
          el.classList.contains('game-widget-container')
        ) {
          widgetFs = true;
          break;
        }
        el = el.parentElement;
      }
      setIsWidgetFullscreen(widgetFs);
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
    // When containerWidth is 0 (before ResizeObserver fires), default to
    // 2 cols so the grid layout renders immediately instead of falling
    // back to the single-column flex layout.
    const fits =
      containerWidth > 0
        ? Math.floor(containerWidth / MIN_BOARD_WIDTH_MOBILE_LANDSCAPE)
        : 2;
    cols = Math.min(2, count, Math.max(1, fits));
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
    // Widget-fs packs more boards per row (accept narrower cells) so the
    // user can see every board at once — that's what widget-fs is for.
    // Page-fs and normal both prefer fewer, bigger cells; page-fs is
    // about more screen real estate, not about shrinking boards.
    const minBoardWidth = isWidgetFullscreen ? 200 : 240;
    const fits = Math.max(1, Math.floor(containerWidth / minBoardWidth));
    cols = Math.min(ideal, count, fits || ideal);
  }

  // Cap at 2 cols whenever there isn't real desktop-wide room: mobile
  // / tablet held sideways (any width ≤1150px in landscape) OR a
  // mobile / tablet WIDGET-fullscreen (where the spec asks for 2 boards
  // fully visible). Page-fs doesn't trip the cap — its goal is more
  // room, not a different column count.
  const wantsTwoColCap = !media.gtMd && (isWidgetFullscreen || isLandscape);
  if (wantsTwoColCap && cols > 2) {
    cols = 2;
  }

  // Floor: when containerWidth is 0 (before ResizeObserver fires), the
  // fits-based calculation may produce cols=1 even for multi-player
  // landscape views. Force at least 2 cols so the grid layout renders
  // immediately instead of falling back to single-column flex.
  if (containerWidth === 0 && count > 1 && isLandscape && cols < 2) {
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
  // "Fit-in-viewport" mode: ONLY widget-fullscreen. The user explicitly
  // chose the widget-expand button to see every board at once, so this
  // is the only state where the grid is allowed to shrink cells.
  //
  // Page-fullscreen and non-fullscreen both keep cells at natural size
  // and let the widget scroll between rows — page-fs is about more
  // screen real estate, not about fitting more on screen. See
  // SeaBattleGrids.md for the full contract.
  const isFitMode = isWidgetFullscreen;
  // Side-layout heuristic — only meaningful in fit mode, where rows
  // are forced down to fit the container. Outside fit mode the row is
  // always `squareRow` so top-layout is always at least as good.
  const probableRowPx =
    containerHeight > 0
      ? Math.floor((containerHeight - rowGap * (rows - 1)) / rows)
      : 0;
  const isHeightTight =
    isFitMode &&
    probableRowPx > 0 &&
    approxCellWidthPx > 0 &&
    probableRowPx < approxCellWidthPx + 18;
  const useSideLayout = isMobileLandscape || isHeightTight;
  // Chrome budget = the section's non-board axis. Side layout: 42v + 55h.
  // Top layout: 115v + 8h. The square-cell row works out to
  //  top:  cellWidth + 115
  //  side: cellWidth - 13   (= cellWidth - 55 + 42)
  const squareRowHeightPx = Math.round(
    useSideLayout ? approxCellWidthPx - 13 : approxCellWidthPx + 115,
  );
  // Row sizing rules (see SeaBattleGrids.md):
  // - Desktop widget-fs: minmax shrinks rows so every board fits on
  //   one screen — the explicit ask of the widget-expand button.
  // - Everything else (mobile any, desktop normal, desktop page-fs):
  //   natural squareRow. Widget scrolls if rows don't fit. Mobile
  //   widget-fs deliberately uses the same sizing as mobile non-fs
  //   per spec ("cells not less than non-fs"); widget-fs's win is the
  //   recovered viewport (no app header), so more of each row is
  //   visible at once without changing the cell size.
  const SAFETY_MIN_ROW_PX = 160;
  const shouldShrinkToFit = isFitMode && media.gtMd;
  const rowTemplate = shouldShrinkToFit
    ? `minmax(${SAFETY_MIN_ROW_PX}px, ${squareRowHeightPx}px)`
    : `${squareRowHeightPx}px`;

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
        gridTemplateRows: `repeat(${rows}, ${rowTemplate})`,
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
