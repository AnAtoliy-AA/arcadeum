# SeaBattleGrids — board grid layout contract

Co-located with [SeaBattleGrids.tsx](./SeaBattleGrids.tsx). Defines how
the multi-board grid sizes itself across viewport, orientation, and
fullscreen state.

## Fullscreen states

There are **three** distinct states. They produce different layouts and
must not be conflated.

| State                  | How it's set                                                                                                                                         | Detection                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Widget fullscreen      | "Expand" button on the widget header (`useFullscreen` on `GameWidgetContainer`)                                                                      | Ancestor matches `.game-widget-container.is-fullscreen`                                       |
| Page (game) fullscreen | Global `f` shortcut or expand button on the page layout (`useFullscreen` on `GamePageLayout`) — expands the [control panel + widget + chat] tri-pane | Ancestor matches `.games-room-container.is-fullscreen` OR `document.fullscreenElement` is set |
| Not fullscreen         | default                                                                                                                                              | neither of the above                                                                          |

Both fullscreen variants are CSS-class based (not the real Fullscreen
API) so body-portaled modals (Dialog.Portal, GameResultModal, etc.)
remain reachable.

## Sizing matrix

Every cell describes what **the rows** of the grid look like. Columns
are decided separately (see "Column count" below).

| Context                     | Rows behavior                                                                                                                                                                                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile portrait             | 1 col only; each board capped at `100dvh − 200px` via CSS (`.sb-grids-container-mobile`). First board fully visible; 2nd peeks; page scrolls.                                                                                                                               |
| Mobile landscape, non-fs    | Natural `squareRow` height. Cells prioritized over fitting. Widget scrolls if rows don't fit.                                                                                                                                                                               |
| Mobile landscape, page-fs   | Same as non-fs. Boards never shrink below their non-fs size.                                                                                                                                                                                                                |
| Mobile landscape, widget-fs | **Same sizing as non-fs** — natural `squareRow`. Cells are never smaller than non-fs per spec ("not less than without fullscreen"). Widget-fs's benefit is the recovered viewport (no app header above), so more of each row is visible at once. Scrolls if rows don't fit. |
| Desktop normal              | Natural `squareRow`. Widget scrolls between rows if needed.                                                                                                                                                                                                                 |
| Desktop page-fs             | Same as normal. Boards never shrink below their normal size.                                                                                                                                                                                                                |
| Desktop widget-fs           | `minmax(SAFETY_MIN, squareRow)` per row. All boards visible at once; cells shrink to fit (with a 160px floor to stay playable). Only state where cells may be shrunk to satisfy a fit goal.                                                                                 |

## Universal invariants

1. **Visible boards are never clipped.** A row that is "in view" must
   render fully top-to-bottom (modulo the deliberate mobile-portrait
   peek-in of the 2nd board, which is a scroll affordance).
2. **Cells in any fullscreen state are never smaller than non-fs.**
   Page-fs and mobile widget-fs both keep natural `squareRow` for this
   reason. The only place cells shrink is desktop widget-fs, where the
   user explicitly opted in to "fit every board on one screen".
3. **Page-fs is about screen real estate, not packing more on screen.**
   Going page-fs expands the play area; cells stay the same size, and
   the recovered space just shows more of each board without scrolling.
4. **Widget-fs is the user opting in to "fit everything I can see"**,
   but only on desktop does this translate into a shrink. On mobile,
   widget-fs keeps cells at non-fs size — the win is the recovered
   viewport (no app header), so more of each row is visible at once.

## Column count

Set in [SeaBattleGrids.tsx](./SeaBattleGrids.tsx) before the row math
runs (`cols` variable). Independent of row sizing:

- `count <= 1` or mobile portrait → 1 column (early return, mobile CSS path).
- `media.short` (very-short landscape) → cap at 2.
- Small-tablet / narrow landscape (`isCompact && isLandscape`) → at
  least 2, balanced via `idealCols`.
- Desktop → `idealCols(count)` (1/2/3/4) bounded by `containerWidth`.
- Mobile/tablet held sideways OR mobile/tablet in widget-fs → cap at 2
  cols so each board stays playable.

## Layout modes (top vs side)

A separate orthogonal choice in [SeaBattleGrids.tsx](./SeaBattleGrids.tsx):

- **Top layout** (default): ships-remaining strip above the board.
  Chrome above board ≈ 115px; below ≈ 0.
- **Side layout** (`.sb-mobile-landscape`): ships-remaining strip on
  the LEFT of the board. Chrome reduces to ~42px vertical, board grows
  ~30% taller in the same cell.

Side layout activates when:

- Mobile landscape (always), OR
- Widget-fs with height-tight cells (each row would otherwise be
  taller-than-wide).

## Tunables

In [SeaBattleGrids.tsx](./SeaBattleGrids.tsx):

| Constant                           | Meaning                                                                                      | Default |
| ---------------------------------- | -------------------------------------------------------------------------------------------- | ------- |
| `SAFETY_MIN_ROW_PX`                | Lowest row height accepted in desktop widget-fs shrink. Below this cells become unplayable.  | 160     |
| `MIN_BOARD_WIDTH_MOBILE_LANDSCAPE` | Minimum cell width before reducing column count in narrow landscape.                         | 200     |
| Mobile portrait CSS chrome         | `100dvh − 200px` cap on board height. The 200 covers app header + widget chrome + safe area. | 200     |

## Tests

E2e specs that assert this layout contract:

- [sea-battle-6-players.spec.ts](../../../../../e2e/sea-battle-6-players.spec.ts) — desktop 1920×1080, mobile portrait 375×812, mobile landscape 844×390.
- [sea-battle-tablet.spec.ts](../../../../../e2e/sea-battle-tablet.spec.ts) — tablet landscape 1024×768 and portrait 768×1024.

These assert column count and display mode, but **not** row sizing or
peek behavior — those need manual verification when changed.
