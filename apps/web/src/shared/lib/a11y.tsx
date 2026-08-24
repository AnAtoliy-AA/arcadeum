'use client';

import {
  useCallback,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

/**
 * Visually hidden live region that announces dynamic game events to screen
 * readers (turn changes, captures, check, game over). The element stays
 * mounted so assistive tech registers it; the message is written to a child
 * text node on change.
 */
export function LiveRegion({
  message,
  assertive = false,
}: {
  message: string;
  assertive?: boolean;
}) {
  const regionId = useId();
  return (
    <div
      id={regionId}
      role="status"
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic="true"
      className="sr-only"
      data-testid="a11y-live-region"
    >
      {message}
    </div>
  );
}

/**
 * Hook that keeps a single announcement string and exposes a memoized
 * `announce` callback plus the live region node to render once per screen.
 */
export function useAnnouncer() {
  const [message, setMessage] = useState('');
  const announce = useCallback((next: string) => {
    setMessage((prev) => (prev === next ? prev : next));
  }, []);

  const liveRegion = message ? <LiveRegion message={message} /> : null;
  return { announce, liveRegion };
}

export interface BoardCellCoords {
  row: number;
  col: number;
}

export interface BoardKeyboardNavigationOptions {
  rows: number;
  cols: number;
  disabled?: boolean;
  onActivate?: (coords: BoardCellCoords) => void;
  /** Called when the user presses Escape while a cell is focused (deselect). */
  onDeselect?: () => void;
}

const CELL_DATA_ATTR = 'data-board-cell';

function makeCellKey(row: number, col: number): string {
  return `${row}:${col}`;
}

/**
 * Adds keyboard navigation to a board grid: arrow keys move between cells,
 * Home/End jump to the first/last column, Enter/Space activate the focused
 * cell, Escape invokes `onDeselect` (e.g. to unselect a piece). A single cell
 * carries `tabIndex={0}` (roving tabindex); the rest are `-1`. Cells must
 * expose `data-board-cell="row:col"` so focus can be moved programmatically.
 *
 * Spread `gridProps` onto the grid container and `getCellProps(row, col)`
 * onto each cell.
 */
export function useBoardKeyboardNavigation({
  rows,
  cols,
  disabled = false,
  onActivate,
  onDeselect,
}: BoardKeyboardNavigationOptions) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [focused, setFocused] = useState<BoardCellCoords | null>(null);
  const propsCacheRef = useRef(new Map<string, Record<string, unknown>>());

  const focusCell = useCallback(
    (row: number, col: number) => {
      const next = {
        row: Math.min(Math.max(row, 0), rows - 1),
        col: Math.min(Math.max(col, 0), cols - 1),
      };
      setFocused(next);
      const cell = gridRef.current?.querySelector<HTMLElement>(
        `[${CELL_DATA_ATTR}="${makeCellKey(next.row, next.col)}"]`,
      );
      cell?.focus();
    },
    [rows, cols],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (disabled) return;
      const current = focused ?? { row: 0, col: 0 };
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          focusCell(current.row - 1, current.col);
          break;
        case 'ArrowDown':
          event.preventDefault();
          focusCell(current.row + 1, current.col);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          focusCell(current.row, current.col - 1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          focusCell(current.row, current.col + 1);
          break;
        case 'Home':
          event.preventDefault();
          focusCell(current.row, 0);
          break;
        case 'End':
          event.preventDefault();
          focusCell(current.row, cols - 1);
          break;
        case 'Enter':
        case ' ':
          if (focused) {
            event.preventDefault();
            onActivate?.(focused);
          }
          break;
        case 'Escape':
          if (focused && onDeselect) {
            event.preventDefault();
            onDeselect();
          }
          break;
        default:
          break;
      }
    },
    [disabled, focused, focusCell, cols, onActivate, onDeselect],
  );

  const gridProps = {
    ref: gridRef,
    tabIndex: disabled ? -1 : 0,
    onKeyDown: handleKeyDown,
  };

  const getCellProps = useCallback(
    (row: number, col: number) => {
      const key = makeCellKey(row, col);
      // Cache per (focused, cell) so memoized cell components keep a stable
      // props object across renders and only re-render when focus actually
      // moves. Bounded: at most 2× the grid size entries.
      const cacheKey = `${focused ? makeCellKey(focused.row, focused.col) : 'none'}|${key}`;
      const cached = propsCacheRef.current.get(cacheKey);
      if (cached) return cached;
      const props = {
        tabIndex: focused?.row === row && focused?.col === col ? 0 : -1,
        [CELL_DATA_ATTR]: key,
        onFocus: () => setFocused({ row, col }),
      };
      propsCacheRef.current.set(cacheKey, props);
      return props;
    },
    [focused],
  );

  return { gridProps, getCellProps, focused };
}

/**
 * Builds a human-readable label for a board cell, e.g. "1a", "3c".
 * Used for `aria-label` on gridcells.
 */
export function boardCellLabel(
  row: number,
  col: number,
  options: { prefix?: string; suffix?: string } = {},
): string {
  const base = `${row + 1}${String.fromCharCode(97 + col)}`;
  return `${options.prefix ? `${options.prefix} ` : ''}${base}${options.suffix ? ` ${options.suffix}` : ''}`;
}
