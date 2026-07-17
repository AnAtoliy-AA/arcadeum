'use client';

import { useCallback, useMemo } from 'react';
import { YStack } from 'tamagui';
import { useCheckersTheme } from '../lib/CheckersThemeContext';
import type { Board, CheckersPlayer, Piece } from '../types';

const BOARD_SIZE = 8;

interface CheckersBoardProps {
  board: Board;
  players: CheckersPlayer[];
  selectedPiece: { row: number; col: number } | null;
  disabled: boolean;
  currentPlayerId: string | null;
  ariaLabel: string;
  onCellClick: (row: number, col: number) => void;
}

export function CheckersBoard({
  board,
  players,
  selectedPiece,
  disabled,
  currentPlayerId,
  ariaLabel,
  onCellClick,
}: CheckersBoardProps) {
  const theme = useCheckersTheme();

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

  return (
    <YStack
      width="100%"
      maxWidth={480}
      aspectRatio="1/1"
      alignSelf="center"
      borderRadius={12}
      overflow="hidden"
      borderWidth={2}
      borderColor={theme.darkSquare}
      style={{ background: theme.boardBackground, boxSizing: 'border-box' }}
      role="grid"
      aria-label={ariaLabel}
      data-testid="checkers-board"
    >
      {Array.from({ length: BOARD_SIZE }).map((_, row) => (
        <YStack
          key={row}
          flexDirection="row"
          flex={1}
          role="row"
        >
          {Array.from({ length: BOARD_SIZE }).map((_, col) => {
            const isDarkSquare = (row + col) % 2 === 1;
            const piece = board[row][col];
            const isSelected =
              selectedPiece?.row === row && selectedPiece?.col === col;
            const isPlayerPiece = piece?.playerId === currentPlayerId;
            const pieceColor = piece ? playerColorMap[piece.playerId] : null;

            return (
              <YStack
                key={`${row}-${col}`}
                flex={1}
                alignItems="center"
                justifyContent="center"
                cursor={disabled ? 'default' : 'pointer'}
                backgroundColor={
                  isSelected
                    ? theme.selectedPiece
                    : isDarkSquare
                      ? theme.darkSquare
                      : theme.lightSquare
                }
                style={{
                  boxSizing: 'border-box',
                  aspectRatio: '1/1',
                }}
                role="button"
                data-testid={`checkers-cell-${row}-${col}`}
                onPress={() => handleClick(row, col)}
              >
                {piece ? (
                  <YStack
                    width="70%"
                    height="70%"
                    borderRadius="50%"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor={
                      pieceColor === 'light' ? theme.lightPiece : theme.darkPiece
                    }
                    borderWidth={2}
                    borderColor={
                      pieceColor === 'light' ? theme.lightPieceBorder : theme.darkPieceBorder
                    }
                    style={{
                      boxShadow: isSelected
                        ? `0 0 12px ${theme.selectedPiece}`
                        : 'none',
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
                  </YStack>
                ) : null}
              </YStack>
            );
          })}
        </YStack>
      ))}
    </YStack>
  );
}
