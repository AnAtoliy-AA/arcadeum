'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { PuzzleControls } from './PuzzleControls';
import { PuzzleRushMenu, type RushMode } from './PuzzleRushMenu';
import { PuzzleRushGameOver } from './PuzzleRushGameOver';
import {
  useRushHighScores,
  saveRushHighScore,
} from '../lib/puzzle-rush-storage';

const PuzzleBoard = dynamic(
  () => import('./PuzzleBoard').then((mod) => mod.PuzzleBoard),
  { ssr: false },
);
import type {
  ChessPuzzle,
  PuzzleSolveResult,
} from '@/features/chess/lib/puzzle-api';
import { getRandomPuzzle, solvePuzzle } from '@/features/chess/lib/puzzle-api';
import { useTranslation } from '@/shared/i18n/useTranslation';
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
import type { PuzzlePhase } from '../hooks/usePuzzleState';

type RushPhase = 'menu' | 'playing' | 'gameover';

interface PuzzleRushProps {
  mode?: RushMode;
}

export function PuzzleRush({ mode: initialMode }: PuzzleRushProps) {
  const { t } = useTranslation();
  const { playSound } = useChessSounds();

  const [phase, setPhase] = useState<RushPhase>('menu');
  const [mode, setMode] = useState<RushMode>(initialMode ?? 'survival');
  const [puzzle, setPuzzle] = useState<ChessPuzzle | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [puzzlePhase, setPuzzlePhase] = useState<PuzzlePhase>('waiting');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(180);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [moveIndex, setMoveIndex] = useState(0);
  const [playerMoves, setPlayerMoves] = useState<string[]>([]);
  const [rating, setRating] = useState(1200);
  const [lastMove, setLastMove] = useState<{
    from: BoardPosition;
    to: BoardPosition;
  } | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<BoardPosition | null>(
    null,
  );
  const [isCheck, setIsCheck] = useState(false);
  const highScores = useRushHighScores();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const actionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const gameStartTimeRef = useRef<number>(0);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearActionTimer = useCallback(() => {
    if (actionTimerRef.current) {
      clearTimeout(actionTimerRef.current);
      actionTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
      clearActionTimer();
    };
  }, [stopTimer, clearActionTimer]);

  const playerColor: PieceColor = useMemo(() => {
    if (!puzzle) return 'white';
    return getPuzzleTurnColor(puzzle.fen);
  }, [puzzle]);

  const loadPuzzle = useCallback(
    async (currentRating?: number) => {
      clearActionTimer();
      setPuzzlePhase('waiting');
      setPlayerMoves([]);
      setMoveIndex(0);
      setLastMove(null);
      setSelectedSquare(null);
      setIsCheck(false);

      const queryRating = currentRating ?? rating;
      try {
        const p = await getRandomPuzzle(queryRating);
        if (p) {
          const initBoard = getPuzzleInitialBoard(p.fen);
          setPuzzle(p);
          setBoard(initBoard);
          setPuzzlePhase('player');
          startTimeRef.current = Date.now();
        } else {
          setPuzzle(null);
          setBoard(null);
        }
      } catch {
        setPuzzle(null);
        setBoard(null);
      }
    },
    [rating, clearActionTimer],
  );

  const endGame = useCallback(
    (finalScore: number) => {
      stopTimer();
      clearActionTimer();
      setPhase('gameover');
      const timeElapsed = Math.floor(
        (Date.now() - gameStartTimeRef.current) / 1000,
      );
      setTotalTime(timeElapsed);

      saveRushHighScore(mode, finalScore);
    },
    [mode, stopTimer, clearActionTimer],
  );

  const handleStart = useCallback(
    (selectedMode: RushMode) => {
      setMode(selectedMode);
      setPhase('playing');
      setScore(0);
      setLives(3);
      setTimeLeft(180);
      setStreak(0);
      setBestStreak(0);
      setTotalTime(0);
      setRating(1200);
      gameStartTimeRef.current = Date.now();

      if (selectedMode === 'timed') {
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              stopTimer();
              setPhase((cur) => {
                if (cur === 'playing') {
                  return 'gameover';
                }
                return cur;
              });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      void loadPuzzle(1200);
    },
    [loadPuzzle, stopTimer],
  );

  const legalMoves = useMemo(() => {
    if (!board || !selectedSquare || puzzlePhase !== 'player') return [];
    return getLegalDestinations(board, playerColor, selectedSquare);
  }, [board, selectedSquare, puzzlePhase, playerColor]);

  const selectSquare = useCallback(
    (pos: BoardPosition | null) => {
      if (puzzlePhase !== 'player' || !board) {
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
    [puzzlePhase, board, playerColor],
  );

  const handleMove = useCallback(
    (moveUci: string) => {
      if (!puzzle || !board || puzzlePhase !== 'player') return;

      const normalizedMove = moveUci.toLowerCase();
      const expectedMove = puzzle.moves[moveIndex]?.toLowerCase();
      if (!expectedMove) return;

      const isPromoMatch =
        expectedMove.startsWith(normalizedMove) ||
        normalizedMove.startsWith(expectedMove);

      const isCorrect = normalizedMove === expectedMove || isPromoMatch;

      if (!isCorrect) {
        setPuzzlePhase('failed');
        playSound('error');

        if (mode === 'survival') {
          const nextLives = lives - 1;
          setLives(nextLives);
          if (nextLives <= 0) {
            endGame(score);
            return;
          }
        }
        setStreak(0);

        actionTimerRef.current = setTimeout(() => {
          actionTimerRef.current = null;
          void loadPuzzle();
        }, 800);
        return;
      }

      const activeMove = isPromoMatch ? expectedMove : normalizedMove;
      const {
        nextBoard,
        isCapture,
        isCheck: oppCheck,
      } = applyUciMoveToBoard(board, activeMove);

      setBoard(nextBoard);
      const parsed = parseUciMove(activeMove);
      setLastMove(parsed);
      setSelectedSquare(null);
      setIsCheck(oppCheck);

      if (isCapture) {
        playSound('capture');
      } else if (oppCheck) {
        playSound('check');
      } else {
        playSound('move');
      }

      const nextIndex = moveIndex + 1;
      const updatedMoves = [...playerMoves, activeMove];
      setPlayerMoves(updatedMoves);
      setMoveIndex(nextIndex);

      if (nextIndex >= puzzle.moves.length) {
        setPuzzlePhase('solved');
        playSound('gameEnd');
        const nextScore = score + 1;
        setScore(nextScore);

        const nextStreak = streak + 1;
        setStreak(nextStreak);
        const updatedBestStreak = Math.max(bestStreak, nextStreak);
        setBestStreak(updatedBestStreak);

        const newRating = rating + 10;
        setRating(newRating);

        const timeMs = Date.now() - startTimeRef.current;
        void solvePuzzle(puzzle.puzzleId, updatedMoves, timeMs).then(
          (res: PuzzleSolveResult) => {
            if (res.ratingChange) {
              setRating((prev) => prev + res.ratingChange);
            }
          },
        );

        actionTimerRef.current = setTimeout(() => {
          actionTimerRef.current = null;
          void loadPuzzle(newRating);
        }, 600);
        return;
      }

      const opponentMove = puzzle.moves[nextIndex];
      if (!opponentMove) return;

      setPuzzlePhase('opponent');

      actionTimerRef.current = setTimeout(() => {
        actionTimerRef.current = null;
        const {
          nextBoard: boardAfterOpponent,
          isCapture: oppCapture,
          isCheck: playerCheck,
        } = applyUciMoveToBoard(nextBoard, opponentMove);

        setBoard(boardAfterOpponent);
        setLastMove(parseUciMove(opponentMove));
        setIsCheck(playerCheck);

        if (oppCapture) {
          playSound('capture');
        } else if (playerCheck) {
          playSound('check');
        } else {
          playSound('move');
        }

        const afterOppIndex = nextIndex + 1;
        setMoveIndex(afterOppIndex);

        if (afterOppIndex >= puzzle.moves.length) {
          setPuzzlePhase('solved');
          playSound('gameEnd');
          const nextScore = score + 1;
          setScore(nextScore);
          const nextStreak = streak + 1;
          setStreak(nextStreak);
          setBestStreak((prev) => Math.max(prev, nextStreak));
          setRating((prev) => prev + 10);

          actionTimerRef.current = setTimeout(() => {
            actionTimerRef.current = null;
            void loadPuzzle();
          }, 600);
        } else {
          setPuzzlePhase('player');
        }
      }, 450);
    },
    [
      puzzle,
      board,
      puzzlePhase,
      moveIndex,
      playerMoves,
      mode,
      lives,
      score,
      streak,
      bestStreak,
      rating,
      playSound,
      loadPuzzle,
      endGame,
    ],
  );

  const handleEndGame = useCallback(() => {
    endGame(score);
  }, [endGame, score]);

  if (phase === 'menu') {
    return <PuzzleRushMenu highScores={highScores} onStart={handleStart} />;
  }

  if (phase === 'gameover') {
    return (
      <PuzzleRushGameOver
        score={score}
        bestStreak={bestStreak}
        totalTime={totalTime}
        rating={rating}
        onPlayAgain={() => setPhase('menu')}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-3 w-full max-w-[900px] mx-auto p-3">
      <div className="flex flex-col gap-2 md:flex-none md:w-[min(70vmin,560px)] md:sticky md:top-3">
        {puzzle && (
          <PuzzleBoard
            puzzle={puzzle}
            phase={puzzlePhase}
            onMove={handleMove}
            board={board}
            playerColor={playerColor}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            isCheck={isCheck}
            onSelectSquare={selectSquare}
          />
        )}
      </div>
      <div className="flex flex-col gap-3 flex-1 min-w-0 md:max-w-[280px]">
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
          <div className="flex items-center gap-2">
            <span className="text-sm">🔥</span>
            <span className="text-sm font-bold text-orange-400">{streak}</span>
          </div>
          <div className="text-sm font-bold text-[var(--color)]">{score}</div>
          {mode === 'survival' && (
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-lg ${i < lives ? 'opacity-100' : 'opacity-30'}`}
                >
                  ❤️
                </span>
              ))}
            </div>
          )}
          {mode === 'timed' && (
            <div className="text-sm font-bold text-sky-400 tabular-nums">
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        <PuzzleControls
          phase={puzzlePhase}
          rating={puzzle?.rating ?? 1200}
          onNext={() => void loadPuzzle()}
        />
        <button
          type="button"
          onClick={handleEndGame}
          data-testid="puzzle-rush-end-run-btn"
          className="w-full py-2 px-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-semibold cursor-pointer hover:bg-red-500/25 transition-colors"
        >
          {t('games.chess_v1.puzzleRush.endRun')}
        </button>
      </div>
    </div>
  );
}
