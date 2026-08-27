'use client';

import { useCallback, useMemo } from 'react';
import { useCheckersTheme } from '../lib/CheckersThemeContext';
import { useBoardKeyboardNavigation } from '@/shared/lib/a11y';
import type { Board, CheckersPlayer } from '../types';

interface CheckersBoardProps {
  board: Board;
  players: CheckersPlayer[];
  selectedPiece: { row: number; col: number } | null;
  highlightedCell?: { row: number; col: number } | null;
  disabled: boolean;
  ariaLabel: string;
  onCellClick: (row: number, col: number) => void;
  /** Clears the current piece selection (Escape key). */
  onDeselect?: () => void;
  isFlipped?: boolean;
}

export function CheckersBoard({
  board,
  players,
  selectedPiece,
  highlightedCell,
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

  const rows = useMemo(() => {
    const arr = Array.from({ length: boardSize }, (_, i) => i);
    return isFlipped ? arr.reverse() : arr;
  }, [boardSize, isFlipped]);

  const cols = useMemo(() => {
    const arr = Array.from({ length: boardSize }, (_, i) => i);
    return isFlipped ? arr.reverse() : arr;
  }, [boardSize, isFlipped]);

  const { gridProps, getCellProps } = useBoardKeyboardNavigation({
    rows: boardSize,
    cols: boardSize,
    disabled,
    onActivate: ({ row, col }) => handleClick(row, col),
    onDeselect,
  });

  const cellLabel = useCallback(
    (row: number, col: number, piece: Board[number][number] | null) => {
      const pos = `${String.fromCharCode(97 + col)}${row + 1}`;
      if (!piece) return `${ariaLabel} ${pos} empty`;
      const color = playerColorMap[piece.playerId] ?? 'unknown';
      const type = piece.type === 'king' ? 'king' : 'man';
      return `${ariaLabel} ${pos} ${color} ${type}`;
    },
    [ariaLabel, playerColorMap],
  );

  return (
    <div
      className="flex flex-col items-stretch w-full max-w-[480px] self-center rounded-[14px] overflow-hidden border-[3px] shadow-[0_12px_36px_rgba(0,0,0,0.6)]"
      style={{
        aspectRatio: '1/1',
        borderColor: '#44403c',
        backgroundColor: '#1c1917',
      }}
      role="grid"
      aria-label={ariaLabel}
      data-testid="checkers-board"
      {...gridProps}
    >
      {rows.map((row) => (
        <div
          className="flex items-stretch flex-row flex-1"
          key={row}
          role="row"
        >
          {cols.map((col) => {
            const isDarkSquare = (row + col) % 2 === 1;
            const piece = board[row][col];
            const isSelected =
              selectedPiece?.row === row && selectedPiece?.col === col;
            const isHighlighted =
              highlightedCell?.row === row && highlightedCell?.col === col;
            const pieceColor = piece ? playerColorMap[piece.playerId] : null;
            const navRow = rows.indexOf(row);
            const navCol = cols.indexOf(col);

            return (
              <div
                className="flex flex-col flex-1 items-center justify-center relative select-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)]"
                style={{
                  cursor: disabled ? 'default' : 'pointer',
                  backgroundColor: isSelected
                    ? theme.selectedPiece
                    : isHighlighted
                      ? 'rgba(99, 102, 241, 0.35)'
                      : isDarkSquare
                        ? theme.darkSquare
                        : theme.lightSquare,
                }}
                onClick={() => handleClick(row, col)}
                key={`${row}-${col}`}
                role="button"
                aria-label={cellLabel(row, col, piece)}
                data-testid={`checkers-cell-${row}-${col}`}
                {...getCellProps(navRow, navCol)}
              >
                {piece ? (
                  <div
                    className="relative flex flex-col w-[76%] h-[76%] rounded-full items-center justify-center shadow-lg transition-transform active:scale-95"
                    style={{
                      backgroundColor:
                        pieceColor === 'light'
                          ? theme.lightPiece
                          : theme.darkPiece,
                      border: `2px solid ${
                        pieceColor === 'light'
                          ? theme.lightPieceBorder
                          : theme.darkPieceBorder
                      }`,
                      boxShadow:
                        '0 4px 8px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <div
                      className="absolute inset-[3px] rounded-full pointer-events-none"
                      style={{
                        border: `1px solid ${
                          pieceColor === 'light'
                            ? 'rgba(0, 0, 0, 0.15)'
                            : 'rgba(255, 255, 255, 0.2)'
                        }`,
                      }}
                    />
                    <div
                      className="absolute inset-[6px] rounded-full pointer-events-none"
                      style={{
                        border: `1px solid ${
                          pieceColor === 'light'
                            ? 'rgba(0, 0, 0, 0.1)'
                            : 'rgba(255, 255, 255, 0.12)'
                        }`,
                      }}
                    />
                    {piece.type === 'king' ? (
                      <span
                        className="relative z-10 select-none text-base sm:text-lg leading-none"
                        style={{
                          color: theme.kingCrown,
                          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6))',
                        }}
                      >
                        👑
                      </span>
                    ) : null}
                  </div>
                ) : null}
                {navCol === cols.length - 1 && (
                  <span
                    className="absolute right-1 top-0.5 text-[9px] font-bold opacity-60 pointer-events-none"
                    style={{
                      color: isDarkSquare ? '#e2e8f0' : '#475569',
                    }}
                  >
                    {8 - row}
                  </span>
                )}
                {navRow === rows.length - 1 && (
                  <span
                    className="absolute left-1 bottom-0.5 text-[9px] font-bold opacity-60 pointer-events-none"
                    style={{
                      color: isDarkSquare ? '#e2e8f0' : '#475569',
                    }}
                  >
                    {String.fromCharCode(97 + col)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
