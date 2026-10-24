import { useMemo } from 'react';
import { cx } from '../../utils/cx';
import type { PracticeDrillBoardProps, PracticeDrillGameId } from './types';
import { renderDrillCell } from './cell-renderers';

const DEFAULT_COLS: Record<PracticeDrillGameId, string[]> = {
  'sea-battle': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  chess: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  checkers: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  'tic-tac-toe': ['1', '2', '3'],
  go: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'],
  sudoku: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
  minesweeper: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
};

const DEFAULT_ROWS: Record<PracticeDrillGameId, string[]> = {
  'sea-battle': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  chess: ['8', '7', '6', '5', '4', '3', '2', '1'],
  checkers: ['8', '7', '6', '5', '4', '3', '2', '1'],
  'tic-tac-toe': ['1', '2', '3'],
  go: ['9', '8', '7', '6', '5', '4', '3', '2', '1'],
  sudoku: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
  minesweeper: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
};

export function PracticeDrillBoard({
  id,
  gameId,
  grid,
  colLabels,
  rowLabels,
  solvedIndex,
  wrongIndex,
  disabled = false,
  onCellClick,
  cellTestIdPrefix = 'puzzle-cell',
  dataTestId = 'practice-drill-board',
}: PracticeDrillBoardProps) {
  const width = grid[0]?.length ?? 3;

  const effectiveCols = useMemo(() => {
    if (colLabels) return colLabels;
    const defaultCols = DEFAULT_COLS[gameId];
    return defaultCols.slice(0, width);
  }, [colLabels, gameId, width]);

  const effectiveRows = useMemo(() => {
    if (rowLabels) return rowLabels;
    const defaultRows = DEFAULT_ROWS[gameId];
    return defaultRows.slice(0, grid.length);
  }, [rowLabels, gameId, grid.length]);

  return (
    <div
      id={id}
      data-testid={dataTestId}
      className="w-full max-w-[380px] sm:max-w-[420px] aspect-square flex flex-col select-none"
    >
      <div className="flex">
        <div className="w-6 sm:w-7 flex-shrink-0" />
        <div className="flex-1 flex">
          {effectiveCols.map((col, idx) => (
            <div
              key={idx}
              className="flex-1 text-center text-[10px] sm:text-xs font-semibold text-[var(--colorMuted)] pb-1"
            >
              {col}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {grid.map((rowStr, rIdx) => (
          <div key={rIdx} className="flex-1 flex">
            <div className="w-6 sm:w-7 flex-shrink-0 flex items-center justify-center text-[10px] sm:text-xs font-semibold text-[var(--colorMuted)] pr-1">
              {effectiveRows[rIdx] ?? rIdx + 1}
            </div>
            <div className="flex-1 flex">
              {rowStr.split('').map((char, cIdx) => {
                const cellIndex = rIdx * width + cIdx;
                const isSolved = solvedIndex === cellIndex;
                const isWrong = wrongIndex === cellIndex;
                const { className: cellClass, content } = renderDrillCell(
                  gameId,
                  char,
                  rIdx,
                  cIdx,
                );
                const isClickable = !disabled && Boolean(onCellClick);

                return (
                  <button
                    key={cIdx}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (onCellClick) {
                        onCellClick(cellIndex, rIdx, cIdx);
                      }
                    }}
                    data-testid={`${cellTestIdPrefix}-${cellIndex}`}
                    aria-label={`Square ${effectiveCols[cIdx] ?? cIdx + 1}${effectiveRows[rIdx] ?? rIdx + 1}: ${char || 'empty'}`}
                    className={cx(
                      'flex-1 aspect-square flex items-center justify-center text-sm sm:text-base font-bold transition-all duration-150',
                      cellClass,
                      isClickable &&
                        'cursor-pointer hover:border-[var(--primary)] hover:scale-[1.03] active:scale-95',
                      isSolved &&
                        'border-[var(--success,#22c55e)] bg-[var(--success,#22c55e)]/25 text-[var(--success,#22c55e)] ring-2 ring-[var(--success,#22c55e)]/50',
                      isWrong &&
                        'border-red-500 bg-red-500/25 text-red-400 ring-2 ring-red-500/50',
                    )}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
