'use client';

import { memo } from 'react';
import type {
  File,
  Rank,
  Board,
  BoardPosition,
} from '@arcadeum/games-core/games/chess/chess.types';
import {
  FILES,
  PIECE_SYMBOLS,
} from '@arcadeum/games-core/games/chess/chess.constants';

interface AnalysisBoardGridProps {
  board: Board;
  selectedSquare: BoardPosition | null;
  legalMoves: Array<{ from: BoardPosition; to: BoardPosition }>;
  lastMove: { from: BoardPosition; to: BoardPosition } | null;
  kingPosition: BoardPosition | null;
  isCheck: boolean;
  pendingPromotion: { from: BoardPosition; to: BoardPosition } | null;
  flipBoard: boolean;
  onSquareClick: (file: File, rank: Rank) => void;
}

function AnalysisBoardGridImpl({
  board,
  selectedSquare,
  legalMoves,
  lastMove,
  kingPosition,
  isCheck,
  pendingPromotion,
  flipBoard,
  onSquareClick,
}: AnalysisBoardGridProps) {
  const ranks: Rank[] = flipBoard
    ? [1, 2, 3, 4, 5, 6, 7, 8]
    : [8, 7, 6, 5, 4, 3, 2, 1];
  const files: File[] = flipBoard
    ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']
    : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div
      className="flex gap-1 items-stretch"
      style={{ maxWidth: 'min(60vmin, 480px)' }}
    >
      <div className="flex flex-col justify-between py-1 text-[10px] text-[var(--textSecondary)] opacity-60 w-4 text-center">
        {ranks.map((r) => (
          <span key={r}>{r}</span>
        ))}
      </div>
      <div className="flex-1 relative">
        <div
          className="w-full rounded-xl overflow-hidden border-2 border-[rgba(255,255,255,0.1)] shadow-2xl"
          style={{ aspectRatio: '1 / 1' }}
        >
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
            {ranks.map((rank) =>
              files.map((file) => {
                const rowIdx = 8 - rank;
                const colIdx = FILES.indexOf(file);
                const piece = board[rowIdx]?.[colIdx] ?? null;
                const isLight = (rowIdx + colIdx) % 2 === 0;
                const isSelected =
                  selectedSquare?.file === file &&
                  selectedSquare?.rank === rank;
                const isLegalTarget = legalMoves.some(
                  (m) =>
                    m.from.file === selectedSquare?.file &&
                    m.from.rank === selectedSquare?.rank &&
                    m.to.file === file &&
                    m.to.rank === rank,
                );
                const isLastMoveSquare =
                  lastMove &&
                  ((lastMove.from.file === file &&
                    lastMove.from.rank === rank) ||
                    (lastMove.to.file === file && lastMove.to.rank === rank));
                const isKingSq =
                  kingPosition?.file === file && kingPosition?.rank === rank;
                const isPendingTarget =
                  pendingPromotion?.to.file === file &&
                  pendingPromotion?.to.rank === rank;

                let bgColor = isLight ? '#e8d5b5' : '#a97d50';
                if (isSelected) bgColor = '#8297d2';
                else if (isKingSq && isCheck) bgColor = '#e74c3c';
                else if (isPendingTarget) bgColor = 'rgba(251, 191, 36, 0.45)';
                else if (isLastMoveSquare) bgColor = 'rgba(155, 199, 0, 0.41)';

                return (
                  <div
                    key={`${file}-${rank}`}
                    className="flex items-center justify-center cursor-pointer relative"
                    style={{ backgroundColor: bgColor, aspectRatio: '1 / 1' }}
                    onClick={() => onSquareClick(file, rank)}
                  >
                    {isLegalTarget && !piece && (
                      <div className="w-[28%] h-[28%] rounded-full bg-[rgba(0,0,0,0.15)]" />
                    )}
                    {isLegalTarget && piece && (
                      <div className="absolute inset-0 rounded-full border-2 border-[rgba(0,0,0,0.15)]" />
                    )}
                    {piece && (
                      <span className="text-[min(7vmin,3.5rem)] leading-none select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                        {
                          PIECE_SYMBOLS[
                            piece.type as keyof typeof PIECE_SYMBOLS
                          ][piece.color as 'white' | 'black']
                        }
                      </span>
                    )}
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const AnalysisBoardGrid = memo(AnalysisBoardGridImpl);
