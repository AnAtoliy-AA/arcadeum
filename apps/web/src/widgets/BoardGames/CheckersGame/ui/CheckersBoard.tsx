'use client';

import { useCallback, useMemo } from 'react';
import { Checkerboard } from '@arcadeum/ui';
import { useCheckersTheme } from '../lib/CheckersThemeContext';
import { boardVars } from '../lib/theme-adapter';
import { useBoardKeyboardNavigation } from '@/shared/lib/a11y';
import type { Board, CheckersPlayer } from '../types';

interface CheckersBoardProps {
  board: Board;
  players: CheckersPlayer[];
  selectedPiece: { row: number; col: number } | null;
  highlightedCell?: { row: number; col: number } | null;
  hintCell?: {
    from: { row: number; col: number };
    to: { row: number; col: number };
  } | null;
  disabled: boolean;
  ariaLabel: string;
  onCellClick: (row: number, col: number) => void;
  onDeselect?: () => void;
  isFlipped?: boolean;
}

export function CheckersBoard({
  board,
  players,
  selectedPiece,
  highlightedCell,
  hintCell,
  disabled,
  ariaLabel,
  onCellClick,
  onDeselect,
  isFlipped = false,
}: CheckersBoardProps) {
  const theme = useCheckersTheme();
  const boardSize = board.length;

  const handleClick = useCallback(
    (row: number, col: number) => {
      if (!disabled) onCellClick(row, col);
    },
    [disabled, onCellClick],
  );

  const playerColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of players) {
      map[p.playerId] = p.color;
    }
    return map;
  }, [players]);

  const { gridProps, getCellProps } = useBoardKeyboardNavigation({
    rows: boardSize,
    cols: boardSize,
    disabled,
    onActivate: ({ row, col }) => handleClick(row, col),
    onDeselect,
  });

  const cellLabel = useCallback(
    (row: number, col: number, piece: Board[number][number] | null) => {
      const pos = `${String.fromCharCode(97 + col)}${8 - row}`;
      if (!piece) return `${ariaLabel} ${pos} empty`;
      const color = playerColorMap[piece.playerId] ?? 'unknown';
      const type = piece.type === 'king' ? 'king' : 'man';
      return `${ariaLabel} ${pos} ${color} ${type}`;
    },
    [ariaLabel, playerColorMap],
  );

  const vars = useMemo(() => boardVars(theme), [theme]);

  return (
    <div
      style={vars}
      className="flex flex-col items-stretch w-full max-w-[480px] self-center"
      data-testid="checkers-board"
      {...gridProps}
    >
      <Checkerboard
        rows={boardSize}
        cols={boardSize}
        isFlipped={isFlipped}
        ariaLabel={ariaLabel}
        dataTestId="checkers-checkerboard"
        renderCell={({
          row,
          col,
          isDark,
          isBottomRank,
          isLastFile,
          rankLabel,
          fileLabel,
        }) => {
          const piece = board[row]?.[col] ?? null;
          const isSelected =
            selectedPiece?.row === row && selectedPiece?.col === col;
          const isHighlighted =
            highlightedCell?.row === row && highlightedCell?.col === col;
          const isHintFrom =
            hintCell?.from.row === row && hintCell?.from.col === col;
          const isHintTo = hintCell?.to.row === row && hintCell?.to.col === col;
          const pieceColor = piece ? playerColorMap[piece.playerId] : null;

          let bgClass = isDark
            ? 'bg-[var(--board-square-dark)]'
            : 'bg-[var(--board-square-light)]';

          if (isSelected) {
            bgClass =
              'bg-[var(--checkers-selected-piece)] ring-2 ring-amber-400/80 inset-ring';
          } else if (isHintFrom) {
            bgClass = 'bg-amber-400/30 ring-2 ring-amber-400/90';
          } else if (isHintTo) {
            bgClass = 'bg-emerald-500/30 ring-2 ring-emerald-400/80';
          } else if (isHighlighted) {
            bgClass = 'bg-indigo-500/35 ring-2 ring-indigo-400/70';
          }

          return (
            <div
              key={`${row}-${col}`}
              role="button"
              aria-label={cellLabel(row, col, piece)}
              data-testid={`checkers-cell-${row}-${col}`}
              className={`flex-1 aspect-square relative flex items-center justify-center overflow-hidden select-none touch-manipulation transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)] ${bgClass} ${
                disabled ? 'cursor-default' : 'cursor-pointer'
              }`}
              onClick={() => handleClick(row, col)}
              {...getCellProps(row, col)}
            >
              {isLastFile && rankLabel && (
                <span className="pointer-events-none absolute top-0.5 right-0.5 text-[9px] sm:text-[11px] font-bold font-mono text-[var(--board-coord)] opacity-70 leading-none">
                  {rankLabel}
                </span>
              )}

              {isBottomRank && fileLabel && (
                <span className="pointer-events-none absolute bottom-0.5 left-0.5 text-[9px] sm:text-[11px] font-bold font-mono text-[var(--board-coord)] opacity-70 leading-none">
                  {fileLabel}
                </span>
              )}

              {piece ? (
                <div
                  className={`pointer-events-none relative flex flex-col w-[76%] h-[76%] rounded-full items-center justify-center shadow-lg transition-transform active:scale-95 border-2 ${
                    pieceColor === 'light'
                      ? 'bg-[var(--checkers-piece-light)] border-[var(--checkers-piece-light-border)]'
                      : 'bg-[var(--checkers-piece-dark)] border-[var(--checkers-piece-dark-border)]'
                  }`}
                >
                  <div className="absolute inset-[3px] rounded-full pointer-events-none border border-black/15 dark:border-white/20" />
                  <div className="absolute inset-[6px] rounded-full pointer-events-none border border-black/10 dark:border-white/10" />
                  {piece.type === 'king' ? (
                    <span className="relative z-10 select-none text-base sm:text-lg leading-none text-[var(--checkers-king-crown)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                      👑
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        }}
      />
    </div>
  );
}
