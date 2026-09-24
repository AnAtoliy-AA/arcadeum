'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type {
  ChessPuzzle,
  PuzzleSolveResult,
} from '@/features/chess/lib/puzzle-api';
import {
  getRandomPuzzle,
  solvePuzzle,
  getDailyPuzzle,
} from '@/features/chess/lib/puzzle-api';
import type {
  Board,
  BoardPosition,
} from '@arcadeum/games-core/games/chess/chess.types';
import type { PieceColor } from '@arcadeum/games-core/games/chess/chess.constants';
import {
  getPuzzleInitialBoard,
  getPuzzleTurnColor,
  applyUciMoveToBoard,
  parseUciMove,
  getLegalDestinations,
} from '../lib/puzzle-chess-engine';
import { useChessSounds } from '@/widgets/BoardGames/ChessGame/hooks/useChessSounds';

export type PuzzlePhase =
  'waiting' | 'opponent' | 'player' | 'solved' | 'failed' | 'solution';

interface UsePuzzleStateOptions {
  mode?: 'daily' | 'rated' | 'themed';
  theme?: string;
  rating?: number;
  date?: Date | string;
  onSolved?: (res: {
    puzzle: ChessPuzzle;
    moves: string[];
    timeMs: number;
  }) => void;
  onFailed?: (puzzle: ChessPuzzle) => void;
}

export function usePuzzleState(options: UsePuzzleStateOptions = {}) {
  const { mode = 'rated', theme, rating, date } = options;
  const { playSound } = useChessSounds();

  const [puzzle, setPuzzle] = useState<ChessPuzzle | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [phase, setPhase] = useState<PuzzlePhase>('waiting');
  const [moveIndex, setMoveIndex] = useState(0);
  const [playerMoves, setPlayerMoves] = useState<string[]>([]);
  const [result, setResult] = useState<PuzzleSolveResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<BoardPosition | null>(
    null,
  );
  const [lastMove, setLastMove] = useState<{
    from: BoardPosition;
    to: BoardPosition;
  } | null>(null);
  const [hintMove, setHintMove] = useState<{
    from: BoardPosition;
    to: BoardPosition;
  } | null>(null);
  const [isCheck, setIsCheck] = useState(false);
  const [kingPosition, setKingPosition] = useState<BoardPosition | null>(null);

  const startTimeRef = useRef<number>(0);
  const loadedRef = useRef(false);
  const mountedRef = useRef(false);
  const opponentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const solutionTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const playerColor: PieceColor = useMemo(() => {
    if (!puzzle) return 'white';
    return getPuzzleTurnColor(puzzle.fen);
  }, [puzzle]);

  const clearAllTimers = useCallback(() => {
    if (opponentTimerRef.current) {
      clearTimeout(opponentTimerRef.current);
      opponentTimerRef.current = null;
    }
    for (const t of solutionTimersRef.current) {
      clearTimeout(t);
    }
    solutionTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const initPuzzleState = useCallback((p: ChessPuzzle) => {
    const initialBoard = getPuzzleInitialBoard(p.fen);
    setPuzzle(p);
    setBoard(initialBoard);
    setPhase('player');
    setMoveIndex(0);
    setPlayerMoves([]);
    setResult(null);
    setSelectedSquare(null);
    setLastMove(null);
    setHintMove(null);
    setIsCheck(false);
    setKingPosition(null);
    startTimeRef.current = Date.now();
  }, []);

  const loadPuzzle = useCallback(
    async (overrideRating?: number, overrideTheme?: string) => {
      if (!mountedRef.current) return;
      clearAllTimers();
      setLoading(true);
      setPhase('waiting');
      setPlayerMoves([]);
      setResult(null);

      const activeRating = overrideRating ?? rating;
      const activeTheme = overrideTheme ?? theme;

      try {
        let p: ChessPuzzle | null = null;
        if (mode === 'daily') {
          p = await getDailyPuzzle(date);
        } else {
          p = await getRandomPuzzle(activeRating, activeTheme);
        }
        if (p) {
          initPuzzleState(p);
        } else {
          setPuzzle(null);
          setBoard(null);
        }
      } catch {
        setPuzzle(null);
        setBoard(null);
      } finally {
        setLoading(false);
      }
    },
    [mode, theme, rating, date, clearAllTimers, initPuzzleState],
  );

  useEffect(() => {
    if (loadedRef.current) return;
    mountedRef.current = true;
    loadedRef.current = true;
    void loadPuzzle();
    return () => {
      mountedRef.current = false;
    };
  }, [loadPuzzle]);

  const legalDestinations = useMemo(() => {
    if (!board || !selectedSquare || phase !== 'player') return [];
    return getLegalDestinations(board, playerColor, selectedSquare);
  }, [board, selectedSquare, phase, playerColor]);

  const selectSquare = useCallback(
    (pos: BoardPosition | null) => {
      if (phase !== 'player' || !board) {
        setSelectedSquare(null);
        return;
      }
      if (!pos) {
        setSelectedSquare(null);
        return;
      }
      const rankIdx = 8 - pos.rank;
      const fileIdx = pos.file.charCodeAt(0) - 97;
      const piece = board[rankIdx]?.[fileIdx];
      if (piece && piece.color === playerColor) {
        setSelectedSquare(pos);
      } else {
        setSelectedSquare(null);
      }
    },
    [phase, board, playerColor],
  );

  const makeMove = useCallback(
    (moveUci: string) => {
      if (!puzzle || !board || phase !== 'player') return;

      const normalizedMove = moveUci.toLowerCase();
      const expectedMove = puzzle.moves[moveIndex]?.toLowerCase();

      if (!expectedMove) return;

      const isPromoMatch =
        expectedMove.startsWith(normalizedMove) ||
        normalizedMove.startsWith(expectedMove);

      const matches = normalizedMove === expectedMove || isPromoMatch;

      if (!matches) {
        setPhase('failed');
        playSound('error');
        setResult({
          solved: false,
          ratingChange: -10,
          puzzle,
        });
        options.onFailed?.(puzzle);
        return;
      }

      const activeMove = isPromoMatch ? expectedMove : normalizedMove;
      const {
        nextBoard,
        isCapture,
        isCheck: oppInCheck,
        kingPos,
      } = applyUciMoveToBoard(board, activeMove);

      setBoard(nextBoard);
      const parsed = parseUciMove(activeMove);
      setLastMove(parsed);
      setSelectedSquare(null);
      setHintMove(null);
      setIsCheck(oppInCheck);
      setKingPosition(kingPos);

      if (isCapture) {
        playSound('capture');
      } else if (oppInCheck) {
        playSound('check');
      } else {
        playSound('move');
      }

      const nextIndex = moveIndex + 1;
      const updatedMoves = [...playerMoves, activeMove];
      setPlayerMoves(updatedMoves);
      setMoveIndex(nextIndex);

      if (nextIndex >= puzzle.moves.length) {
        const timeMs = Date.now() - startTimeRef.current;
        setPhase('solved');
        playSound('gameEnd');
        options.onSolved?.({ puzzle, moves: updatedMoves, timeMs });
        solvePuzzle(puzzle.puzzleId, updatedMoves, timeMs)
          .then(setResult)
          .catch(() => {
            setResult({ solved: true, ratingChange: 10, puzzle });
          });
        return;
      }

      const opponentMove = puzzle.moves[nextIndex];
      if (!opponentMove) return;

      setPhase('opponent');

      if (opponentTimerRef.current) {
        clearTimeout(opponentTimerRef.current);
      }

      opponentTimerRef.current = setTimeout(() => {
        opponentTimerRef.current = null;
        const {
          nextBoard: boardAfterOpponent,
          isCapture: oppCapture,
          isCheck: playerInCheck,
          kingPos: playerKingPos,
        } = applyUciMoveToBoard(nextBoard, opponentMove);

        setBoard(boardAfterOpponent);
        const oppParsed = parseUciMove(opponentMove);
        setLastMove(oppParsed);
        setIsCheck(playerInCheck);
        setKingPosition(playerKingPos);

        if (oppCapture) {
          playSound('capture');
        } else if (playerInCheck) {
          playSound('check');
        } else {
          playSound('move');
        }

        const afterOppIndex = nextIndex + 1;
        setMoveIndex(afterOppIndex);

        if (afterOppIndex >= puzzle.moves.length) {
          const timeMs = Date.now() - startTimeRef.current;
          setPhase('solved');
          playSound('gameEnd');
          options.onSolved?.({ puzzle, moves: updatedMoves, timeMs });
          solvePuzzle(puzzle.puzzleId, updatedMoves, timeMs)
            .then(setResult)
            .catch(() => {
              setResult({ solved: true, ratingChange: 10, puzzle });
            });
        } else {
          setPhase('player');
        }
      }, 500);
    },
    [puzzle, board, phase, moveIndex, playerMoves, playSound, options],
  );

  const retry = useCallback(() => {
    if (!puzzle) return;
    clearAllTimers();
    initPuzzleState(puzzle);
  }, [puzzle, clearAllTimers, initPuzzleState]);

  const showHint = useCallback(() => {
    if (!puzzle || phase !== 'player') return;
    const currentExpectedMove = puzzle.moves[moveIndex];
    if (!currentExpectedMove) return;

    const parsed = parseUciMove(currentExpectedMove);
    setHintMove(parsed);
    setSelectedSquare(parsed.from);
    playSound('notification');
  }, [puzzle, phase, moveIndex, playSound]);

  const showSolution = useCallback(() => {
    if (!puzzle || !board || phase === 'solution' || phase === 'solved') return;
    clearAllTimers();
    setPhase('solution');
    setSelectedSquare(null);
    setHintMove(null);

    let currentBoard = board;
    const remainingMoves = puzzle.moves.slice(moveIndex);

    remainingMoves.forEach((move, i) => {
      const timer = setTimeout(
        () => {
          const {
            nextBoard,
            isCapture,
            isCheck: moveCheck,
            kingPos,
          } = applyUciMoveToBoard(currentBoard, move);

          currentBoard = nextBoard;
          setBoard(nextBoard);
          setLastMove(parseUciMove(move));
          setIsCheck(moveCheck);
          setKingPosition(kingPos);

          if (isCapture) {
            playSound('capture');
          } else if (moveCheck) {
            playSound('check');
          } else {
            playSound('move');
          }

          if (i === remainingMoves.length - 1) {
            setPhase('solved');
            playSound('gameEnd');
          }
        },
        (i + 1) * 600,
      );

      solutionTimersRef.current.push(timer);
    });
  }, [puzzle, board, phase, moveIndex, clearAllTimers, playSound]);

  return {
    puzzle,
    board,
    playerColor,
    phase,
    playerMoves,
    result,
    loading,
    selectedSquare,
    legalDestinations,
    lastMove,
    hintMove,
    isCheck,
    kingPosition,
    loadPuzzle,
    makeMove,
    retry,
    showHint,
    showSolution,
    selectSquare,
  };
}
