'use client';

import { memo, useCallback, useMemo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useBoardKeyboardNavigation } from '@/shared/lib/a11y';
import { STAR_POINTS, type Cell, type Point, type StoneColor } from '../types';

interface GoBoardProps {
  board: Cell[][];
  size: number;
  disabled: boolean;
  lastMove: Point | null;
  koPoint: Point | null;
  myColor: StoneColor | null;
  ariaLabel?: string;
  onCellClick: (row: number, col: number) => void;
}

interface CellProps {
  row: number;
  col: number;
  size: number;
  cell: Cell;
  isStar: boolean;
  isLastMove: boolean;
  isKo: boolean;
  disabled: boolean;
  myColor: StoneColor | null;
  focusProps: Record<string, unknown>;
  onCellClick: (row: number, col: number) => void;
}

const CellRenderer = memo(function CellRenderer({
  row,
  col,
  size,
  cell,
  isStar,
  isLastMove,
  isKo,
  disabled,
  myColor,
  focusProps,
  onCellClick,
}: CellProps) {
  const handleClick = useCallback(() => {
    if (!disabled && cell === null) onCellClick(row, col);
  }, [disabled, cell, onCellClick, row, col]);

  const isLeftEdge = col === 0;
  const isRightEdge = col === size - 1;
  const isTopEdge = row === 0;
  const isBottomEdge = row === size - 1;

  return (
    <button
      type="button"
      role="gridcell"
      data-testid={`go-cell-${row}-${col}`}
      data-board-cell={`${row}:${col}`}
      disabled={disabled || cell !== null}
      onClick={handleClick}
      className={cx(
        'group relative m-0 flex flex-1 h-full w-full min-h-0 min-w-0 items-center justify-center p-0 border-0 bg-transparent aspect-square outline-none',
        disabled || cell !== null ? 'cursor-default' : 'cursor-pointer',
        'focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:z-20',
      )}
      {...focusProps}
    >
      <span
        aria-hidden="true"
        className={cx(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 h-[1.5px] bg-[#5c3008]/75 z-0',
          isLeftEdge
            ? 'left-1/2 right-0'
            : isRightEdge
              ? 'left-0 right-1/2'
              : 'left-0 right-0',
        )}
      />

      <span
        aria-hidden="true"
        className={cx(
          'pointer-events-none absolute left-1/2 -translate-x-1/2 w-[1.5px] bg-[#5c3008]/75 z-0',
          isTopEdge
            ? 'top-1/2 bottom-0'
            : isBottomEdge
              ? 'top-0 bottom-1/2'
              : 'top-0 bottom-0',
        )}
      />

      {isStar && !cell ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-[#4a2404] shadow-sm z-0"
        />
      ) : null}

      {!disabled && cell === null && !isKo && myColor ? (
        <span
          aria-hidden="true"
          className={cx(
            'pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[82%] w-[82%] rounded-full opacity-0 transition-opacity duration-150 group-hover:opacity-40 z-10',
            myColor === 'black'
              ? 'bg-black shadow-md'
              : 'bg-white shadow-md border border-slate-300',
          )}
        />
      ) : null}

      {cell ? (
        <span
          aria-hidden="true"
          className={cx(
            'pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[84%] w-[84%] rounded-full z-10 transition-transform duration-100',
            cell === 'black'
              ? 'bg-gradient-to-br from-[#3a3d40] via-[#1c1d1f] to-[#0a0a0b] shadow-[0_4px_8px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.3)] border border-black/40'
              : 'bg-gradient-to-br from-[#ffffff] via-[#f0f3f6] to-[#d6dce3] shadow-[0_4px_8px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.9)] border border-slate-300',
          )}
        >
          {isLastMove ? (
            <span
              className={cx(
                'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[36%] w-[36%] rounded-full border-2',
                cell === 'black' ? 'border-white/90' : 'border-neutral-900/90',
              )}
            />
          ) : null}
        </span>
      ) : null}

      {isKo ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[50%] w-[50%] rounded-full border-2 border-dashed border-red-500/80 z-10"
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
  const stars = useMemo(() => {
    const set = new Set<string>();
    for (const [r, c] of STAR_POINTS[size] ?? []) set.add(`${r}:${c}`);
    return set;
  }, [size]);

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
      className="flex justify-center items-center w-full select-none p-1"
    >
      <div
        role="grid"
        aria-label={ariaLabel}
        data-testid="go-board"
        className="w-[min(88vw,520px)] h-[min(88vw,520px)] aspect-square flex flex-col rounded-2xl border-[6px] border-[#8a4b14] bg-gradient-to-br from-[#e4a853] via-[#d1913c] to-[#b87828] p-3 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.3)] ring-1 ring-amber-900/50 shrink-0"
        {...gridProps}
      >
        {board.map((row, rowIdx) => (
          <div
            key={`row-${rowIdx}`}
            role="row"
            className="flex flex-1 w-full h-full min-h-0 min-w-0"
          >
            {row.map((cell, colIdx) => (
              <CellRenderer
                key={`${rowIdx}-${colIdx}`}
                row={rowIdx}
                col={colIdx}
                size={size}
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
