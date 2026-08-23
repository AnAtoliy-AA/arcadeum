'use client';

import { memo, useCallback, useMemo } from 'react';
import { useBoardKeyboardNavigation } from '@/shared/lib/a11y';
import { useGoTheme } from '../lib/GoThemeContext';
import { STAR_POINTS, type Cell, type Point, type StoneColor } from '../types';

const CELL_PX = 30;
const GAP_PX = 2;
const BOARD_PADDING_PX = 10;

interface GoBoardProps {
  board: Cell[][];
  size: number;
  disabled: boolean;
  lastMove: Point | null;
  koPoint: Point | null;
  /** Colour the local player would place — used for the hover ghost. */
  myColor: StoneColor | null;
  ariaLabel?: string;
  onCellClick: (row: number, col: number) => void;
}

interface CellProps {
  row: number;
  col: number;
  cell: Cell;
  isStar: boolean;
  isLastMove: boolean;
  isKo: boolean;
  disabled: boolean;
  myColor: StoneColor | null;
  theme: ReturnType<typeof useGoTheme>;
  focusProps: Record<string, unknown>;
  onCellClick: (row: number, col: number) => void;
}

const CellRenderer = memo(function CellRenderer({
  row,
  col,
  cell,
  isStar,
  isLastMove,
  isKo,
  disabled,
  myColor,
  theme,
  focusProps,
  onCellClick,
}: CellProps) {
  const handleClick = useCallback(() => {
    if (!disabled && cell === null) onCellClick(row, col);
  }, [disabled, cell, onCellClick, row, col]);

  const stoneStyle: React.CSSProperties =
    cell === 'black'
      ? { background: theme.blackStone, borderColor: theme.stoneBorder }
      : { background: theme.whiteStone, borderColor: theme.stoneBorder };

  return (
    <button
      type="button"
      role="gridcell"
      data-testid={`go-cell-${row}-${col}`}
      data-board-cell={`${row}:${col}`}
      disabled={disabled || cell !== null}
      onClick={handleClick}
      className="group relative m-0 flex items-center justify-center border-0 bg-transparent p-0"
      style={{ cursor: disabled ? 'default' : 'pointer' }}
      {...focusProps}
    >
      {/* Intersection cross-hair lines */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          inset: '0',
          borderTop: `1px solid ${theme.gridLine}`,
          borderLeft: `1px solid ${theme.gridLine}`,
          opacity: 0.9,
        }}
      />
      {/* Hover ghost stone */}
      {!disabled && cell === null && !isKo && myColor ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full opacity-0 transition-opacity duration-150 group-hover:opacity-40"
          style={{
            width: '78%',
            height: '78%',
            background:
              myColor === 'black' ? theme.blackStone : theme.whiteStone,
            boxShadow: `inset 0 -1px 2px rgba(255,255,255,0.25), inset 0 1px 3px rgba(0,0,0,0.45)`,
            zIndex: 1,
          }}
        />
      ) : null}
      {/* Star point */}
      {isStar && !cell ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            width: '18%',
            height: '18%',
            background: theme.gridLine,
            opacity: 1,
            zIndex: 0,
          }}
        />
      ) : null}
      {/* Placed stone */}
      {cell ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            ...stoneStyle,
            width: '82%',
            height: '82%',
            borderWidth: 1,
            borderStyle: 'solid',
            boxShadow:
              cell === 'black'
                ? 'inset 0 1px 3px rgba(255,255,255,0.28), 0 1px 2px rgba(0,0,0,0.5)'
                : 'inset 0 1px 3px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.35)',
            zIndex: 2,
          }}
        >
          {/* Last-move marker */}
          {isLastMove ? (
            <span
              className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: '34%',
                height: '34%',
                border: `2px solid ${
                  cell === 'black' ? '#ffffffcc' : '#11131899'
                }`,
              }}
            />
          ) : null}
        </span>
      ) : null}
      {isKo ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            width: '46%',
            height: '46%',
            border: `2px dashed ${theme.lastMoveMarker}`,
            opacity: 0.8,
            zIndex: 1,
          }}
        />
      ) : null}
    </button>
  );
});

function GoBoardImpl({
  board,
  size,
  disabled,
  lastMove,
  koPoint,
  myColor,
  ariaLabel = 'Go board',
  onCellClick,
}: GoBoardProps) {
  const theme = useGoTheme();

  const stars = useMemo(() => {
    const set = new Set<string>();
    for (const [r, c] of STAR_POINTS[size] ?? []) set.add(`${r}:${c}`);
    return set;
  }, [size]);

  const isScrollable = size > 13;

  // The grid is a column of `role="row"` rows so the ARIA structure is valid
  // (grid → row → gridcell), mirroring ChessBoard.
  const boardStyle: React.CSSProperties = useMemo(
    () =>
      isScrollable
        ? {
            display: 'flex',
            flexDirection: 'column',
            gap: `${GAP_PX}px`,
            padding: `${BOARD_PADDING_PX}px`,
            backgroundColor: theme.boardBackground,
            borderRadius: theme.borderRadius,
            width: 'max-content',
          }
        : {
            display: 'flex',
            flexDirection: 'column',
            gap: `${GAP_PX}px`,
            padding: `${BOARD_PADDING_PX}px`,
            backgroundColor: theme.boardBackground,
            borderRadius: theme.borderRadius,
            // Explicit width + border-box prevents an empty-grid collapse.
            width: '100%',
            maxWidth: 'min(88vmin, 560px)',
            aspectRatio: '1 / 1',
            boxSizing: 'border-box',
            margin: '0 auto',
          },
    [isScrollable, theme.boardBackground, theme.borderRadius],
  );

  const rowStyle: React.CSSProperties = useMemo(
    () =>
      isScrollable
        ? {
            display: 'grid',
            gridTemplateColumns: `repeat(${size}, ${CELL_PX}px)`,
            gridTemplateRows: `${CELL_PX}px`,
            gap: `${GAP_PX}px`,
          }
        : {
            display: 'grid',
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: 'minmax(0, 1fr)',
            gap: `${GAP_PX}px`,
            flex: 1,
          },
    [isScrollable, size],
  );

  const handleActivate = useCallback(
    ({ row, col }: { row: number; col: number }) => {
      if (!disabled && board[row]?.[col] === null) onCellClick(row, col);
    },
    [board, disabled, onCellClick],
  );

  const { gridProps, getCellProps } = useBoardKeyboardNavigation({
    rows: size,
    cols: size,
    disabled,
    onActivate: handleActivate,
  });

  return (
    <div
      data-testid="go-board-wrapper"
      style={
        isScrollable
          ? {
              width: '100%',
              maxWidth: 'min(92vmin, 640px)',
              margin: '0 auto',
              overflow: 'auto',
              borderRadius: theme.borderRadius,
            }
          : undefined
      }
    >
      <div
        role="grid"
        aria-label={ariaLabel}
        data-testid="go-board"
        style={boardStyle}
        {...gridProps}
      >
        {board.map((row, rowIdx) => (
          <div key={`row-${rowIdx}`} role="row" style={rowStyle}>
            {row.map((cell, colIdx) => (
              <CellRenderer
                key={`${rowIdx}-${colIdx}`}
                row={rowIdx}
                col={colIdx}
                cell={cell}
                isStar={stars.has(`${rowIdx}:${colIdx}`)}
                isLastMove={
                  !!lastMove &&
                  lastMove.row === rowIdx &&
                  lastMove.col === colIdx
                }
                isKo={
                  !!koPoint && koPoint.row === rowIdx && koPoint.col === colIdx
                }
                disabled={disabled}
                myColor={myColor}
                theme={theme}
                focusProps={getCellProps(rowIdx, colIdx)}
                onCellClick={onCellClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export const GoBoard = memo(GoBoardImpl);
