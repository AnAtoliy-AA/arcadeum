'use client';

import { useCallback } from 'react';
import {
  FILES,
  type File,
  type Rank,
  type BoardPosition,
  type PieceType,
} from '../types';
import type { ChessClientState } from '../types';
import type { SoundType } from '../lib/sounds';
import { isPromotionMove } from '../lib/promotion';

interface UseSquareClickArgs {
  displaySnapshot: ChessClientState | null;
  myColor: 'white' | 'black' | null;
  selectedSquare: BoardPosition | null;
  legalMoves: BoardPosition[];
  isGameOver: boolean;
  movePiece: (
    fromFile: File,
    fromRank: Rank,
    toFile: File,
    toRank: Rank,
    promotion?: PieceType,
  ) => void;
  applyOptimisticMove: (
    fromFile: File,
    fromRank: Rank,
    toFile: File,
    toRank: Rank,
    promotion?: PieceType,
  ) => void;
  /** @deprecated sounds come from useChessGameSounds; kept for callers. */
  playSound?: (type: SoundType) => void;
  confirmMoves: boolean;
  pendingMove: { from: BoardPosition; to: BoardPosition } | null;
  setPendingMove: (
    m: { from: BoardPosition; to: BoardPosition } | null,
  ) => void;
  setSelectedSquare: (s: BoardPosition | null) => void;
  setPendingPromotion: (
    p: { from: BoardPosition; to: BoardPosition } | null,
  ) => void;
}

export function useSquareClick({
  displaySnapshot,
  myColor,
  selectedSquare,
  legalMoves,
  isGameOver,
  movePiece,
  applyOptimisticMove,
  confirmMoves,
  pendingMove,
  setPendingMove,
  setSelectedSquare,
  setPendingPromotion,
}: UseSquareClickArgs) {
  // Move sounds are played by useChessGameSounds when the move lands in the
  // (optimistic) history, which also knows about check and castling.
  const executeMove = useCallback(
    (from: BoardPosition, to: BoardPosition) => {
      if (!displaySnapshot || !myColor) return;
      if (isPromotionMove(displaySnapshot, from, to)) {
        setPendingPromotion({ from, to });
      } else {
        applyOptimisticMove(from.file, from.rank, to.file, to.rank);
        movePiece(from.file, from.rank, to.file, to.rank);
      }
    },
    [
      displaySnapshot,
      myColor,
      movePiece,
      applyOptimisticMove,
      setPendingPromotion,
    ],
  );

  return useCallback(
    (file: File, rank: Rank) => {
      if (!displaySnapshot || !myColor || isGameOver) return;
      const piece = displaySnapshot.board[8 - rank]?.[FILES.indexOf(file)];
      if (
        selectedSquare &&
        selectedSquare.file === file &&
        selectedSquare.rank === rank
      ) {
        // Tapping the selected piece again deselects it.
        setSelectedSquare(null);
        setPendingMove(null);
        return;
      }
      if (selectedSquare) {
        const isLegal = legalMoves.some(
          (m) => m.file === file && m.rank === rank,
        );
        if (isLegal) {
          if (
            confirmMoves &&
            (!pendingMove ||
              pendingMove.to.file !== file ||
              pendingMove.to.rank !== rank)
          ) {
            setPendingMove({ from: selectedSquare, to: { file, rank } });
            return;
          }
          executeMove(selectedSquare, { file, rank });
          setSelectedSquare(null);
          setPendingMove(null);
          return;
        }
        if (piece?.color === myColor) {
          setSelectedSquare({ file, rank });
          setPendingMove(null);
          return;
        }
        setSelectedSquare(null);
        setPendingMove(null);
        return;
      }
      if (
        pendingMove &&
        pendingMove.to.file === file &&
        pendingMove.to.rank === rank
      ) {
        executeMove(pendingMove.from, pendingMove.to);
        setSelectedSquare(null);
        setPendingMove(null);
        return;
      }
      if (piece?.color === myColor) setSelectedSquare({ file, rank });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      displaySnapshot,
      myColor,
      selectedSquare,
      legalMoves,
      isGameOver,
      confirmMoves,
      pendingMove,
      executeMove,
      setPendingMove,
    ],
  );
}
