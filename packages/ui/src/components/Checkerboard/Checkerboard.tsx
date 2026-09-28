import { forwardRef, useMemo } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface CheckerboardCellInfo {
  row: number;
  col: number;
  isDark: boolean;
  isBottomRank: boolean;
  isLastFile: boolean;
  rankLabel?: string | number;
  fileLabel?: string;
}

export interface CheckerboardProps {
  rows?: number;
  cols?: number;
  isFlipped?: boolean;
  showCoordinates?: boolean;
  fileLabels?: string[];
  rankLabels?: (string | number)[];
  ariaLabel?: string;
  className?: string;
  gridClassName?: string;
  dataTestId?: string;
  renderCell: (info: CheckerboardCellInfo) => ReactNode;
  children?: ReactNode;
}

const DEFAULT_FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export const Checkerboard = forwardRef<HTMLDivElement, CheckerboardProps>(
  function Checkerboard(
    {
      rows = 8,
      cols = 8,
      isFlipped = false,
      showCoordinates = true,
      fileLabels = DEFAULT_FILES,
      rankLabels,
      ariaLabel = 'Board',
      className,
      gridClassName,
      dataTestId = 'checkerboard',
      renderCell,
      children,
    },
    ref,
  ) {
    const rowIndices = useMemo(() => {
      const arr = Array.from({ length: rows }, (_, i) => i);
      return isFlipped ? arr.reverse() : arr;
    }, [rows, isFlipped]);

    const colIndices = useMemo(() => {
      const arr = Array.from({ length: cols }, (_, i) => i);
      return isFlipped ? arr.reverse() : arr;
    }, [cols, isFlipped]);

    const defaultRanks = useMemo(() => {
      return Array.from({ length: rows }, (_, i) => rows - i);
    }, [rows]);

    const effectiveRanks = rankLabels ?? defaultRanks;

    return (
      <div
        ref={ref}
        role="grid"
        aria-label={ariaLabel}
        data-testid={dataTestId}
        className={cx(
          'relative w-full h-full max-h-full aspect-square p-1.5 sm:p-2.5 rounded-2xl bg-[var(--board-bg,var(--chess-board-bg,var(--glassBg)))] border border-[var(--glassBorder)] shadow-2xl backdrop-blur-xl transition-all duration-300 touch-manipulation select-none',
          className,
        )}
      >
        <div
          className={cx(
            'relative z-10 w-full h-full aspect-square rounded-xl overflow-hidden shadow-inner border border-white/10 flex flex-col',
            gridClassName,
          )}
        >
          {rowIndices.map((row) => (
            <div key={row} role="row" className="flex flex-1">
              {colIndices.map((col) => {
                const isDark = (row + col) % 2 === 1;
                const isBottomRank =
                  rowIndices[rowIndices.length - 1] === row;
                const isLastFile =
                  colIndices[colIndices.length - 1] === col;
                const rankLabel = showCoordinates
                  ? effectiveRanks[row]
                  : undefined;
                const fileLabel = showCoordinates
                  ? fileLabels[col]
                  : undefined;

                return renderCell({
                  row,
                  col,
                  isDark,
                  isBottomRank,
                  isLastFile,
                  rankLabel,
                  fileLabel,
                });
              })}
            </div>
          ))}
        </div>
        {children}
      </div>
    );
  },
);
