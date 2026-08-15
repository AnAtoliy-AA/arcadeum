'use client';
import { memo, useMemo } from 'react';
import type { CellState } from '../../types';
import { CELL_STATE } from '../../types';
import { useSeaBattleTheme } from '../../lib/SeaBattleThemeContext';

interface FieldStatusProps {
  board: CellState[][];
  isMe: boolean;
}

interface BoardStats {
  hitCells: number;
  missCells: number;
  unexploredCells: number;
  totalCells: number;
}

function computeBoardStats(board: CellState[][]): BoardStats {
  let hitCells = 0;
  let missCells = 0;

  const rows = board.length;
  const cols = board[0]?.length ?? 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r]?.[c];
      if (cell === CELL_STATE.HIT) hitCells++;
      else if (cell === CELL_STATE.MISS) missCells++;
    }
  }

  const totalCells = rows * cols;
  const unexploredCells = totalCells - hitCells - missCells;

  return { hitCells, missCells, unexploredCells, totalCells };
}

export const FieldStatus = memo(function FieldStatus({
  board,
  isMe: _isMe,
}: FieldStatusProps) {
  const theme = useSeaBattleTheme();
  const stats = useMemo(() => computeBoardStats(board), [board]);

  return (
    <div className="flex flex-row justify-end items-center py-1 px-2 bg-[rgba(0,0,0,0.3)] rounded-2xl">
      <div className="flex flex-row gap-6 items-center">
        <div className="flex flex-row gap-2 items-center">
          <div
            className="flex flex-col items-stretch w-[4px] h-[4px] rounded"
            style={{ backgroundColor: theme.hitColor }}
          />
          <span
            className="text-[40px] font-bold"
            style={{ color: theme.hitColor }}
          >
            {stats.hitCells}
          </span>
        </div>
        <span className="text-[32px] text-[rgba(255,255,255,0.3)]">·</span>
        <div className="flex flex-row gap-2 items-center">
          <div
            className="flex flex-col items-stretch w-[4px] h-[4px] rounded"
            style={{ backgroundColor: theme.missColor }}
          />
          <span
            className="text-[40px] font-bold"
            style={{ color: theme.missColor }}
          >
            {stats.missCells}
          </span>
        </div>
      </div>
      <span
        className="text-[40px] text-[rgba(255,255,255,0.5)] -ml-4"
        style={{ fontFamily: 'monospace' } as React.CSSProperties}
      >
        {stats.unexploredCells}/{stats.totalCells} (
        {Math.round((stats.unexploredCells / stats.totalCells) * 100)}%)
      </span>
    </div>
  );
});
