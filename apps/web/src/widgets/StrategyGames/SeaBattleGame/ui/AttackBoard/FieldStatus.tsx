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
    <div className="flex flex-row justify-end items-center py-0.5 px-1.5 bg-[rgba(0,0,0,0.3)] rounded-md text-[11px] shrink-0">
      <div className="flex flex-row gap-2 items-center">
        <div className="flex flex-row gap-1 items-center">
          <div
            className="w-[5px] h-[5px] rounded-[1px]"
            style={{ backgroundColor: theme.hitColor }}
          />
          <span
            className="text-[12px] font-bold"
            style={{ color: theme.hitColor }}
          >
            {stats.hitCells}
          </span>
        </div>
        <span className="text-[11px] text-[rgba(255,255,255,0.3)]">·</span>
        <div className="flex flex-row gap-1 items-center">
          <div
            className="w-[5px] h-[5px] rounded-[1px]"
            style={{ backgroundColor: theme.missColor }}
          />
          <span
            className="text-[12px] font-bold"
            style={{ color: theme.missColor }}
          >
            {stats.missCells}
          </span>
        </div>
      </div>
      <span className="text-[11px] text-[rgba(255,255,255,0.5)] ml-1.5 font-mono">
        {stats.unexploredCells}/{stats.totalCells} (
        {Math.round((stats.unexploredCells / stats.totalCells) * 100)}%)
      </span>
    </div>
  );
});
