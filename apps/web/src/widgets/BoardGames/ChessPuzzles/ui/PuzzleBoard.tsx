'use client';

import { memo, useMemo, useCallback, useState } from 'react';
import { ChessBoard } from '@/widgets/BoardGames/ChessGame/ui/ChessBoard';
import type { ChessPuzzle } from '@/features/chess/lib/puzzle-api';
import { parseFenPiecePlacement } from '@/features/analysis/lib/fen';
import type {
  Board,
  BoardPosition,
  File,
  Rank,
  PieceColor,
} from '@/widgets/BoardGames/ChessGame/types';
import type { PuzzlePhase } from '../hooks/usePuzzleState';

interface PuzzleBoardProps {
  puzzle: ChessPuzzle;
  phase: PuzzlePhase;
  onMove: (moveUci: string) => void;
  board?: Board | null;
  playerColor?: PieceColor;
  selectedSquare?: BoardPosition | null;
  legalMoves?: BoardPosition[];
  lastMove?: { from: BoardPosition; to: BoardPosition } | null;
  hintMove?: { from: BoardPosition; to: BoardPosition } | null;
  isCheck?: boolean;
  kingPosition?: BoardPosition | null;
  onSelectSquare?: (pos: BoardPosition | null) => void;
}

function PuzzleBoardImpl({
  puzzle,
  phase,
  onMove,
  board: externalBoard,
  playerColor: externalPlayerColor,
  selectedSquare: externalSelectedSquare,
  legalMoves: externalLegalMoves,
  lastMove: externalLastMove,
  hintMove,
  isCheck = false,
  kingPosition = null,
  onSelectSquare,
}: PuzzleBoardProps) {
  const [internalSelectedSquare, setInternalSelectedSquare] =
    useState<BoardPosition | null>(null);

  const fallbackBoard = useMemo(
    () => parseFenPiecePlacement(puzzle.fen),
    [puzzle.fen],
  );

  const board = externalBoard ?? fallbackBoard;

  const currentColor = useMemo(() => {
    if (externalPlayerColor) return externalPlayerColor;
    const parts = puzzle.fen.split(' ');
    return (parts[1] === 'b' ? 'black' : 'white') as PieceColor;
  }, [puzzle.fen, externalPlayerColor]);

  const selectedSquare =
    externalSelectedSquare !== undefined
      ? externalSelectedSquare
      : internalSelectedSquare;

  const legalMoves = externalLegalMoves ?? [];
  const lastMove = externalLastMove ?? null;

  const handleSquareClick = useCallback(
    (file: File, rank: Rank) => {
      if (phase !== 'player') return;

      const targetPos: BoardPosition = { file, rank };

      if (selectedSquare) {
        if (
          selectedSquare.file === targetPos.file &&
          selectedSquare.rank === targetPos.rank
        ) {
          if (onSelectSquare) {
            onSelectSquare(null);
          } else {
            setInternalSelectedSquare(null);
          }
          return;
        }

        const moveUci = `${selectedSquare.file}${selectedSquare.rank}${file}${rank}`;
        onMove(moveUci);

        if (onSelectSquare) {
          onSelectSquare(null);
        } else {
          setInternalSelectedSquare(null);
        }
        return;
      }

      if (onSelectSquare) {
        onSelectSquare(targetPos);
      } else {
        setInternalSelectedSquare(targetPos);
      }
    },
    [phase, selectedSquare, onMove, onSelectSquare],
  );

  const handlePieceDrop = useCallback(
    (fromFile: File, fromRank: Rank, toFile: File, toRank: Rank) => {
      if (phase !== 'player') return;
      const moveUci = `${fromFile}${fromRank}${toFile}${toRank}`;
      onMove(moveUci);
      if (onSelectSquare) {
        onSelectSquare(null);
      } else {
        setInternalSelectedSquare(null);
      }
    },
    [phase, onMove, onSelectSquare],
  );

  const handleDeselect = useCallback(() => {
    if (onSelectSquare) {
      onSelectSquare(null);
    } else {
      setInternalSelectedSquare(null);
    }
  }, [onSelectSquare]);

  const isDisabled = phase !== 'player';

  return (
    <ChessBoard
      board={board}
      myColor={currentColor}
      isFlipped={currentColor === 'black'}
      disabled={isDisabled}
      selectedSquare={selectedSquare}
      legalMoves={legalMoves}
      lastMove={lastMove}
      hintMove={hintMove}
      isCheck={isCheck}
      kingPosition={kingPosition}
      ariaLabel="Chess puzzle board"
      onSquareClick={handleSquareClick}
      onDeselectSquare={handleDeselect}
      onPieceDrop={handlePieceDrop}
    />
  );
}

export const PuzzleBoard = memo(PuzzleBoardImpl);
