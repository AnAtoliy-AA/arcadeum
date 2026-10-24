import type { ReactNode } from 'react';

export type PracticeDrillGameId =
  | 'sea-battle'
  | 'chess'
  | 'checkers'
  | 'tic-tac-toe'
  | 'go'
  | 'sudoku'
  | 'minesweeper';

export interface PracticeDrillBoardProps {
  id?: string;
  gameId: PracticeDrillGameId;
  grid: string[];
  colLabels?: string[];
  rowLabels?: string[];
  solvedIndex?: number | null;
  wrongIndex?: number | null;
  disabled?: boolean;
  onCellClick?: (cellIndex: number, r: number, c: number) => void;
  cellTestIdPrefix?: string;
  dataTestId?: string;
}

export interface CellRenderResult {
  className: string;
  content: ReactNode;
}
