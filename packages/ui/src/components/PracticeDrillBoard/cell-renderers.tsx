import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { PracticeDrillGameId, CellRenderResult } from './types';

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

function renderSeaBattleCell(char: string): CellRenderResult {
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
      'bg-white/[0.03] text-transparent border border-white/10 hover:bg-white/[0.08]',
    content: '',
  };
}

function renderChessCell(char: string, isDark: boolean): CellRenderResult {
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

function renderCheckersCell(char: string, isDark: boolean): CellRenderResult {
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

function renderTicTacToeCell(char: string): CellRenderResult {
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

function renderGoCell(char: string): CellRenderResult {
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
): CellRenderResult {
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

function renderMinesweeperCell(char: string): CellRenderResult {
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
        'bg-red-950/40 text-red-400 font-bold border border-red-500/40 text-xs sm:text-sm flex items-center justify-center',
      content: '💣',
    };
  }
  if (char === 'S' || char === '✓') {
    return {
      className:
        'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 text-xs sm:text-sm flex items-center justify-center',
      content: '✓',
    };
  }
  const num = parseInt(char, 10);
  if (!Number.isNaN(num)) {
    const numColors: Record<number, string> = {
      1: 'text-sky-400',
      2: 'text-emerald-400',
      3: 'text-red-400',
      4: 'text-indigo-400',
      5: 'text-amber-400',
      6: 'text-teal-400',
      7: 'text-pink-400',
      8: 'text-purple-400',
    };
    return {
      className: cx(
        'bg-white/5 font-mono font-bold text-xs sm:text-sm border border-white/10',
        numColors[num] ?? 'text-white',
      ),
      content: char,
    };
  }
  return {
    className:
      'bg-neutral-800/80 border border-white/10 hover:bg-neutral-700/80',
    content: '',
  };
}

export function renderDrillCell(
  gameId: PracticeDrillGameId,
  char: string,
  r: number,
  c: number,
): CellRenderResult {
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
