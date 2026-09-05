'use client';

import { memo, useMemo, useCallback, useState } from 'react';
import { ChessBoard } from '@/widgets/BoardGames/ChessGame/ui/ChessBoard';
import type { ChessPuzzle } from '@/features/chess/lib/puzzle-api';
import { parseFen } from '@/features/analysis/lib/fen';
import type { BoardPosition, File, Rank } from '@/widgets/BoardGames/ChessGame/types';
import { FILES } from '@/widgets/BoardGames/ChessGame/types';

interface PuzzleBoardProps {
  puzzle: ChessPuzzle;
  phase: 'waiting' | 'opponent' | 'player' | 'solved' | 'failed';
  onMove: (moveUci: string) => void;
}

function uciToFromTo(uci: string): { from: BoardPosition; to: BoardPosition } | null {
  if (uci.length < 4) return null;
  const fromFile = uci[0] as File;
  const fromRank = parseInt(uci[1], 10) as Rank;
  const toFile = uci[2] as File;
  const toRank = parseInt(uci[3], 10) as Rank;
  if (!FILES.includes(fromFile) || !FILES.includes(toFile)) return null;
  return {
    from: { file: fromFile, rank: fromRank },
    to: { file: toFile, rank: toRank },
  };
}

function PuzzleBoardImpl({ puzzle, phase, onMove }: PuzzleBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<BoardPosition | null>(null);

  const board = useMemo(() => {
    const parsed = parseFen(puzzle.fen);
    return parsed.board;
  }, [puzzle.fen]);

  const currentColor = useMemo(() => {
    const parts = puzzle.fen.split(' ');
    return (parts[1] === 'w' ? 'white' : 'black') as 'white' | 'black';
  }, [puzzle.fen]);

  const legalMoves = useMemo(() => {
    // For puzzles, we need to determine legal moves from the solution
    // This is simplified — in production, use the chess engine
    return [];
  }, [puzzle]);

  const handleSquareClick = useCallback(
    (file: File, rank: Rank) => {
      if (phase !== 'player') return;

      if (selectedSquare) {
        const moveUci = `${selectedSquare.file}${selectedSquare.rank}${file}${rank}`;
        onMove(moveUci);
        setSelectedSquare(null);
        return;
      }

      setSelectedSquare({ file, rank });
    },
    [phase, selectedSquare, onMove],
  );

  const handlePieceDrop = useCallback(
    (fromFile: File, fromRank: Rank, toFile: File, toRank: Rank) => {
      if (phase !== 'player') return;
      const moveUci = `${fromFile}${fromRank}${toFile}${toRank}`;
      onMove(moveUci);
    },
    [phase, onMove],
  );

  const isDisabled = phase !== 'player';

  return (
    <ChessBoard
      board={board}
      myColor={currentColor}
      isFlipped={currentColor === 'black'}
      disabled={isDisabled}
      selectedSquare={selectedSquare}
      legalMoves={legalMoves}
      lastMove={null}
      hintMove={null}
      isCheck={false}
      kingPosition={null}
      ariaLabel="Chess puzzle board"
      onSquareClick={handleSquareClick}
      onDeselectSquare={() => setSelectedSquare(null)}
      onPieceDrop={handlePieceDrop}
    />
  );
}

export const PuzzleBoard = memo(PuzzleBoardImpl);
