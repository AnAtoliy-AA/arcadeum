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
import { getLegalDestinations } from '../lib/puzzle-chess-engine';

interface PuzzleBoardProps {
  puzzle?: ChessPuzzle;
  phase?: PuzzlePhase;
  onMove?: (moveUci: string) => void;
  board?: Board | null;
  playerColor?: PieceColor;
  isFlipped?: boolean;
  selectedSquare?: BoardPosition | null;
  legalMoves?: BoardPosition[];
  lastMove?: { from: BoardPosition; to: BoardPosition } | null;
  hintMove?: { from: BoardPosition; to: BoardPosition } | null;
  isCheck?: boolean;
  kingPosition?: BoardPosition | null;
  onSelectSquare?: (pos: BoardPosition | null) => void;
}

const EMPTY_LEGAL_MOVES: BoardPosition[] = [];

function PuzzleBoardImpl({
  puzzle,
  phase = 'player',
  onMove,
  board: externalBoard,
  playerColor: externalPlayerColor,
  isFlipped: externalIsFlipped,
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

  const puzzleFen = puzzle?.fen;

  const fallbackBoard = useMemo(
    () => (puzzleFen ? parseFenPiecePlacement(puzzleFen) : []),
    [puzzleFen],
  );

  const board = externalBoard ?? fallbackBoard;

  const currentColor = useMemo(() => {
    if (externalPlayerColor) return externalPlayerColor;
    if (puzzleFen) {
      const parts = puzzleFen.split(' ');
      return (parts[1] === 'b' ? 'black' : 'white') as PieceColor;
    }
    return 'white' as PieceColor;
  }, [puzzleFen, externalPlayerColor]);

  const isFlipped =
    externalIsFlipped !== undefined
      ? externalIsFlipped
      : currentColor === 'black';

  const selectedSquare =
    externalSelectedSquare !== undefined
      ? externalSelectedSquare
      : internalSelectedSquare;

  const legalMoves = externalLegalMoves ?? EMPTY_LEGAL_MOVES;
  const lastMove = externalLastMove ?? null;

  const stateRef = useMemo(
    () => ({
      phase,
      selectedSquare,
      legalMoves,
      board,
      currentColor,
      onMove,
      onSelectSquare,
    }),
    [
      phase,
      selectedSquare,
      legalMoves,
      board,
      currentColor,
      onMove,
      onSelectSquare,
    ],
  );

  const handleSquareClick = useCallback(
    (file: File, rank: Rank) => {
      const {
        phase: curPhase,
        selectedSquare: curSelected,
        legalMoves: curLegalMoves,
        board: curBoard,
        currentColor: curColor,
        onMove: curOnMove,
        onSelectSquare: curOnSelectSquare,
      } = stateRef;

      if (curPhase !== 'player') return;

      const targetPos: BoardPosition = { file, rank };

      if (curSelected) {
        if (
          curSelected.file === targetPos.file &&
          curSelected.rank === targetPos.rank
        ) {
          if (curOnSelectSquare) {
            curOnSelectSquare(null);
          } else {
            setInternalSelectedSquare(null);
          }
          return;
        }

        const isLegal = curLegalMoves.some(
          (m) => m.file === file && m.rank === rank,
        );

        if (isLegal) {
          const moveUci = `${curSelected.file}${curSelected.rank}${file}${rank}`;
          curOnMove?.(moveUci);
          if (curOnSelectSquare) {
            curOnSelectSquare(null);
          } else {
            setInternalSelectedSquare(null);
          }
          return;
        }

        const rankIdx = 8 - rank;
        const fileIdx = file.charCodeAt(0) - 97;
        const clickedPiece = curBoard[rankIdx]?.[fileIdx];
        if (clickedPiece && clickedPiece.color === curColor) {
          if (curOnSelectSquare) {
            curOnSelectSquare(targetPos);
          } else {
            setInternalSelectedSquare(targetPos);
          }
          return;
        }

        if (curOnSelectSquare) {
          curOnSelectSquare(null);
        } else {
          setInternalSelectedSquare(null);
        }
        return;
      }

      const rankIdx = 8 - rank;
      const fileIdx = file.charCodeAt(0) - 97;
      const piece = curBoard[rankIdx]?.[fileIdx];
      if (piece && piece.color === curColor) {
        if (curOnSelectSquare) {
          curOnSelectSquare(targetPos);
        } else {
          setInternalSelectedSquare(targetPos);
        }
      }
    },
    [stateRef],
  );

  const handlePieceDrop = useCallback(
    (fromFile: File, fromRank: Rank, toFile: File, toRank: Rank) => {
      const {
        phase: curPhase,
        board: curBoard,
        currentColor: curColor,
        onMove: curOnMove,
        onSelectSquare: curOnSelectSquare,
      } = stateRef;

      if (curPhase !== 'player') return;

      const destinations = getLegalDestinations(curBoard, curColor, {
        file: fromFile,
        rank: fromRank,
      });
      const isLegal = destinations.some(
        (d) => d.file === toFile && d.rank === toRank,
      );
      if (!isLegal) {
        return;
      }

      const moveUci = `${fromFile}${fromRank}${toFile}${toRank}`;
      curOnMove?.(moveUci);
      if (curOnSelectSquare) {
        curOnSelectSquare(null);
      } else {
        setInternalSelectedSquare(null);
      }
    },
    [stateRef],
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
      isFlipped={isFlipped}
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
