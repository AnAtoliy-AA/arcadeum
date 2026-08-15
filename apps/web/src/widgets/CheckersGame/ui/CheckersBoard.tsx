'use client';

import { useCallback, useMemo } from 'react';
import { useCheckersTheme } from '../lib/CheckersThemeContext';
import type { Board, CheckersPlayer } from '../types';

interface CheckersBoardProps {
  board: Board;
  players: CheckersPlayer[];
  selectedPiece: { row: number; col: number } | null;
  highlightedCell?: { row: number; col: number } | null;
  disabled: boolean;
  ariaLabel: string;
  onCellClick: (row: number, col: number) => void;
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

  return (
    <div
      className="box-border flex flex-col items-stretch w-full max-w-[480px] self-center rounded-[12px] overflow-hidden border-[2px]"
      style={{ aspectRatio: '1/1', borderColor: theme.darkSquare }}
      role="grid"
      aria-label={ariaLabel}
      data-testid="checkers-board"
    >
      {rows.map((row) => (
        <div
          className="box-border flex items-stretch flex-row flex-1"
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

            return (
              <div
                className="box-border flex flex-col flex-1 items-center justify-center"
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
                data-testid={`checkers-cell-${row}-${col}`}
              >
                {piece ? (
                  <div
                    className="box-border flex flex-col w-[70%] h-[70%] rounded-[9999px] items-center justify-center border-[2px]"
                    style={{
                      backgroundColor:
                        pieceColor === 'light'
                          ? theme.lightPiece
                          : theme.darkPiece,
                      borderColor:
                        pieceColor === 'light'
                          ? theme.lightPieceBorder
                          : theme.darkPieceBorder,
                    }}
                  >
                    {piece.type === 'king' ? (
                      <span
                        style={{
                          fontSize: '1.2em',
                          color: theme.kingCrown,
                          fontWeight: 800,
                          lineHeight: 1,
                        }}
                      >
                        ♚
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
