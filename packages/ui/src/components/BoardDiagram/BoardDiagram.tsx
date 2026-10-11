import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type BoardDiagramGameId =
  | 'sea-battle'
  | 'chess'
  | 'checkers'
  | 'tic-tac-toe'
  | 'go'
  | 'sudoku'
  | 'minesweeper';

export type BoardDiagramLegendVariant =
  | 'ship'
  | 'hit'
  | 'miss'
  | 'deadzone'
  | 'white'
  | 'black'
  | 'highlight'
  | 'flag'
  | 'mine'
  | 'safe';

export interface BoardDiagramLegendItem {
  variant: BoardDiagramLegendVariant;
  label: string;
}

export interface BoardDiagramProps {
  id?: string;
  gameId: BoardDiagramGameId;
  title: string;
  caption?: string;
  grid: string[];
  colLabels?: string[];
  rowLabels?: string[];
  legend?: BoardDiagramLegendItem[];
  dataTestId?: string;
}

const DEFAULT_COLS: Record<BoardDiagramGameId, string[]> = {
  'sea-battle': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  chess: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  checkers: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  'tic-tac-toe': ['1', '2', '3'],
  go: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'],
  sudoku: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
  minesweeper: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
};

const DEFAULT_ROWS: Record<BoardDiagramGameId, string[]> = {
  'sea-battle': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  chess: ['8', '7', '6', '5', '4', '3', '2', '1'],
  checkers: ['8', '7', '6', '5', '4', '3', '2', '1'],
  'tic-tac-toe': ['1', '2', '3'],
  go: ['9', '8', '7', '6', '5', '4', '3', '2', '1'],
  sudoku: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
  minesweeper: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
};

const CHESS_SYMBOLS: Record<string, string> = {
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
  P: '♙',
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
};

function renderSeaBattleCell(char: string): {
  className: string;
  content: ReactNode;
} {
  if (char === 'S') {
    return {
      className:
        'bg-[var(--primary)] text-white font-bold border border-white/20 shadow-sm',
      content: '■',
    };
  }
  if (char === 'H') {
    return {
      className:
        'bg-red-500 text-white font-black border border-red-300 shadow-inner',
      content: '✕',
    };
  }
  if (char === 'M') {
    return {
      className:
        'bg-sky-500/20 text-sky-400 font-bold border border-sky-500/40',
      content: '•',
    };
  }
  if (char === 'B' || char === '*') {
    return {
      className:
        'bg-white/[0.04] text-white/30 border border-dashed border-white/20',
      content: '·',
    };
  }
  return {
    className:
      'bg-white/[0.03] text-transparent border border-white/10 hover:bg-white/[0.07]',
    content: '',
  };
}

function renderChessCell(
  char: string,
  isDark: boolean,
): { className: string; content: ReactNode } {
  const bg = isDark ? 'bg-amber-950/40' : 'bg-amber-100/10';
  const symbol = CHESS_SYMBOLS[char] ?? (char === '.' ? '' : char);
  const isWhite = char === char.toUpperCase() && char !== '.';
  return {
    className: cx(
      bg,
      'border border-white/5',
      isWhite ? 'text-amber-100 font-bold' : 'text-neutral-400 font-bold',
    ),
    content: symbol,
  };
}

function renderCheckersCell(
  char: string,
  isDark: boolean,
): { className: string; content: ReactNode } {
  const bg = isDark ? 'bg-neutral-900/80' : 'bg-amber-100/10';
  let content: ReactNode = '';
  if (char === 'w') {
    content = (
      <span className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-slate-200 border border-white shadow-sm inline-block" />
    );
  } else if (char === 'W') {
    content = (
      <span className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-slate-200 border-2 border-amber-400 text-amber-600 font-bold text-xs flex items-center justify-center shadow-sm">
        👑
      </span>
    );
  } else if (char === 'b') {
    content = (
      <span className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-red-600 border border-red-400 shadow-sm inline-block" />
    );
  } else if (char === 'B') {
    content = (
      <span className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-red-600 border-2 border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-center shadow-sm">
        👑
      </span>
    );
  }
  return {
    className: cx(bg, 'border border-white/5'),
    content,
  };
}

function renderTicTacToeCell(char: string): {
  className: string;
  content: ReactNode;
} {
  let content: ReactNode = '';
  let color = '';
  if (char === 'X') {
    content = 'X';
    color = 'text-[var(--primary)] font-black text-2xl sm:text-3xl';
  } else if (char === 'O') {
    content = 'O';
    color = 'text-red-400 font-black text-2xl sm:text-3xl';
  } else if (char === '*') {
    content = '★';
    color =
      'text-[var(--success)] font-black text-xl sm:text-2xl bg-[var(--success)]/15';
  }
  return {
    className: cx(
      'bg-white/5 border border-white/10 hover:bg-white/10',
      color,
    ),
    content,
  };
}

function renderGoCell(char: string): {
  className: string;
  content: ReactNode;
} {
  let content: ReactNode = '';
  if (char === 'B') {
    content = (
      <span className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-neutral-900 border border-neutral-700 shadow-md inline-block" />
    );
  } else if (char === 'W') {
    content = (
      <span className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-neutral-100 border border-neutral-300 shadow-md inline-block" />
    );
  } else if (char === 'X') {
    content = <span className="text-red-400 font-bold text-xs sm:text-sm">✕</span>;
  }
  return {
    className: 'bg-amber-950/20 border border-amber-900/30',
    content,
  };
}

function renderSudokuCell(
  char: string,
  r: number,
  c: number,
): { className: string; content: ReactNode } {
  const isRightBorder = c % 3 === 2 && c !== 8;
  const isBottomBorder = r % 3 === 2 && r !== 8;
  const isSpecial = char === '*';
  return {
    className: cx(
      'border border-white/10 font-mono text-xs sm:text-sm font-semibold',
      isRightBorder && 'border-r-2 border-r-[var(--primary)]',
      isBottomBorder && 'border-b-2 border-b-[var(--primary)]',
      isSpecial
        ? 'bg-amber-400/20 text-amber-300 font-bold'
        : char !== '.'
          ? 'bg-white/5 text-[var(--color)]'
          : 'bg-white/[0.02] text-transparent',
    ),
    content: char === '.' ? '' : char,
  };
}

function renderMinesweeperCell(char: string): {
  className: string;
  content: ReactNode;
} {
  if (char === 'F') {
    return {
      className:
        'bg-red-500/15 text-red-400 font-bold border border-red-500/30 text-xs sm:text-sm flex items-center justify-center',
      content: '🚩',
    };
  }
  if (char === '*' || char === 'M') {
    return {
      className:
        'bg-neutral-800 text-rose-400 font-bold border border-rose-500/40 text-xs sm:text-sm flex items-center justify-center',
      content: '💣',
    };
  }
  if (char === '1') {
    return {
      className:
        'bg-white/[0.04] text-sky-400 font-bold border border-white/10 text-xs sm:text-sm',
      content: '1',
    };
  }
  if (char === '2') {
    return {
      className:
        'bg-white/[0.04] text-emerald-400 font-bold border border-white/10 text-xs sm:text-sm',
      content: '2',
    };
  }
  if (char === '3') {
    return {
      className:
        'bg-white/[0.04] text-rose-400 font-bold border border-white/10 text-xs sm:text-sm',
      content: '3',
    };
  }
  if (char === '4') {
    return {
      className:
        'bg-white/[0.04] text-violet-400 font-bold border border-white/10 text-xs sm:text-sm',
      content: '4',
    };
  }
  if (char === '?' || char === 'H') {
    return {
      className:
        'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/60 text-xs sm:text-sm flex items-center justify-center',
      content: '✓',
    };
  }
  if (char === '.' || char === '#') {
    return {
      className:
        'bg-neutral-800/80 hover:bg-neutral-700/80 border border-white/10 shadow-sm',
      content: '',
    };
  }
  return {
    className: 'bg-white/[0.02] border border-white/5 text-transparent',
    content: '',
  };
}

function renderCellByGame(
  gameId: BoardDiagramGameId,
  char: string,
  r: number,
  c: number,
): { className: string; content: ReactNode } {
  const isDark = (r + c) % 2 === 1;
  switch (gameId) {
    case 'sea-battle':
      return renderSeaBattleCell(char);
    case 'chess':
      return renderChessCell(char, isDark);
    case 'checkers':
      return renderCheckersCell(char, isDark);
    case 'tic-tac-toe':
      return renderTicTacToeCell(char);
    case 'go':
      return renderGoCell(char);
    case 'sudoku':
      return renderSudokuCell(char, r, c);
    case 'minesweeper':
      return renderMinesweeperCell(char);
    default:
      return { className: 'border border-white/10', content: char };
  }
}

function renderLegendSwatch(variant: BoardDiagramLegendVariant): ReactNode {
  switch (variant) {
    case 'ship':
      return (
        <span className="w-3.5 h-3.5 rounded-sm bg-[var(--primary)] border border-white/20 inline-block" />
      );
    case 'hit':
      return (
        <span className="w-3.5 h-3.5 rounded-sm bg-red-500 border border-red-300 inline-block" />
      );
    case 'miss':
      return (
        <span className="w-3.5 h-3.5 rounded-sm bg-sky-500/30 border border-sky-400 inline-block" />
      );
    case 'deadzone':
      return (
        <span className="w-3.5 h-3.5 rounded-sm bg-white/10 border border-dashed border-white/30 inline-block" />
      );
    case 'white':
      return (
        <span className="w-3.5 h-3.5 rounded-sm bg-amber-100/30 border border-white/40 inline-block" />
      );
    case 'black':
      return (
        <span className="w-3.5 h-3.5 rounded-sm bg-neutral-900 border border-neutral-700 inline-block" />
      );
    case 'highlight':
      return (
        <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500/30 border border-emerald-400 inline-block" />
      );
    case 'flag':
      return (
        <span className="w-3.5 h-3.5 rounded-sm bg-red-500/20 border border-red-400 text-[10px] flex items-center justify-center">
          🚩
        </span>
      );
    case 'mine':
      return (
        <span className="w-3.5 h-3.5 rounded-sm bg-neutral-800 border border-neutral-600 text-[10px] flex items-center justify-center">
          💣
        </span>
      );
    case 'safe':
      return (
        <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500/30 border border-emerald-400 text-[10px] text-emerald-300 font-bold flex items-center justify-center">
          ✓
        </span>
      );
  }
}

export function BoardDiagram({
  id,
  gameId,
  title,
  caption,
  grid,
  colLabels,
  rowLabels,
  legend,
  dataTestId = 'board-diagram',
}: BoardDiagramProps) {
  const effectiveCols = useMemo(() => {
    if (colLabels) return colLabels;
    const defaultCols = DEFAULT_COLS[gameId];
    const width = grid[0]?.length ?? defaultCols.length;
    return defaultCols.slice(0, width);
  }, [colLabels, gameId, grid]);

  const effectiveRows = useMemo(() => {
    if (rowLabels) return rowLabels;
    const defaultRows = DEFAULT_ROWS[gameId];
    return defaultRows.slice(0, grid.length);
  }, [rowLabels, gameId, grid]);

  return (
    <figure
      id={id}
      data-testid={dataTestId}
      className="my-8 overflow-hidden rounded-2xl border border-[var(--borderColor)] bg-[var(--glassBg)] p-4 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col items-center"
    >
      <figcaption className="w-full text-center mb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)]/15 px-2.5 py-0.5 text-xs font-semibold text-[var(--primary)] uppercase tracking-wider">
          Board Schema
        </span>
        <h3 className="mt-1.5 text-lg font-bold text-[var(--color)]">
          {title}
        </h3>
      </figcaption>

      <div className="w-full max-w-[380px] sm:max-w-[420px] aspect-square flex flex-col select-none">
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
                  const { className: cellClass, content } = renderCellByGame(
                    gameId,
                    char,
                    rIdx,
                    cIdx,
                  );
                  return (
                    <div
                      key={cIdx}
                      className={cx(
                        'flex-1 aspect-square flex items-center justify-center transition-colors',
                        cellClass,
                      )}
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {legend && legend.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-3 border-t border-[var(--borderColor)]/50 pt-3">
          {legend.map((item, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--colorMuted)]"
            >
              {renderLegendSwatch(item.variant)}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {caption && (
        <p className="mt-3 text-center text-xs sm:text-sm text-[var(--colorMuted)] max-w-md leading-relaxed">
          {caption}
        </p>
      )}
    </figure>
  );
}
