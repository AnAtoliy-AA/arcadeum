'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { PuzzleBoard } from './PuzzleBoard';
import { PuzzleControls } from './PuzzleControls';
import type { ChessPuzzle, PuzzleSolveResult } from '@/features/chess/lib/puzzle-api';
import { getRandomPuzzle, solvePuzzle } from '@/features/chess/lib/puzzle-api';
import { useTranslation } from '@/shared/lib/useTranslation';

type RushMode = 'survival' | 'timed';
type RushPhase = 'menu' | 'playing' | 'gameover';

interface PuzzleRushProps {
  mode?: RushMode;
}

export function PuzzleRush({ mode: initialMode }: PuzzleRushProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<RushPhase>('menu');
  const [mode, setMode] = useState<RushMode>(initialMode ?? 'survival');
  const [puzzle, setPuzzle] = useState<ChessPuzzle | null>(null);
  const [puzzlePhase, setPuzzlePhase] = useState<'waiting' | 'opponent' | 'player' | 'solved' | 'failed'>('waiting');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(180);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [playerMoves, setPlayerMoves] = useState<string[]>([]);
  const [rating, setRating] = useState(1200);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const loadPuzzle = useCallback(async () => {
    setPuzzlePhase('waiting');
    setPlayerMoves([]);
    try {
      const p = await getRandomPuzzle(rating);
      setPuzzle(p);
      if (p) {
        setPuzzlePhase('opponent');
        startTimeRef.current = Date.now();
      }
    } catch {
      setPuzzle(null);
    }
  }, [rating]);

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

      if (selectedMode === 'timed') {
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              stopTimer();
              setPhase('gameover');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      void loadPuzzle();
    },
    [loadPuzzle, stopTimer],
  );

  useEffect(() => {
    if (puzzlePhase === 'opponent' && puzzle) {
      const timer = setTimeout(() => setPuzzlePhase('player'), 500);
      return () => clearTimeout(timer);
    }
  }, [puzzlePhase, puzzle]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const handleMove = useCallback(
    (moveUci: string) => {
      if (!puzzle || puzzlePhase !== 'player') return;

      const newMoves = [...playerMoves, moveUci];
      setPlayerMoves(newMoves);

      const expectedMoves = puzzle.moves;
      const isCorrect =
        newMoves.length <= expectedMoves.length &&
        newMoves.every((m, i) => m === expectedMoves[i]);

      if (!isCorrect) {
        setPuzzlePhase('failed');
        if (mode === 'survival') {
          setLives((prev) => {
            const next = prev - 1;
            if (next <= 0) {
              stopTimer();
              setPhase('gameover');
            }
            return next;
          });
        } else {
          setStreak(0);
        }
        return;
      }

      if (newMoves.length === expectedMoves.length) {
        setPuzzlePhase('solved');
        setScore((prev) => prev + 1);
        setStreak((prev) => {
          const next = prev + 1;
          if (next > bestStreak) setBestStreak(next);
          return next;
        });
        setRating((prev) => prev + 10);
        setTotalTime(Math.floor((Date.now() - startTimeRef.current) / 1000));

        const timeMs = Date.now() - startTimeRef.current;
        void solvePuzzle(puzzle.puzzleId, newMoves, timeMs).then(
          (result: PuzzleSolveResult) => {
            if (result.ratingChange) {
              setRating((prev) => prev + result.ratingChange);
            }
          },
        );

        setTimeout(() => void loadPuzzle(), 1000);
      }
    },
    [puzzle, puzzlePhase, playerMoves, mode, bestStreak, loadPuzzle, stopTimer],
  );

  const handleEndGame = useCallback(() => {
    stopTimer();
    setPhase('gameover');
  }, [stopTimer]);

  if (phase === 'menu') {
    return (
      <div className="flex flex-col items-center gap-6 p-8 max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-black text-[var(--color)] mb-2">
            {t('games.chess_v1.puzzleRush.title')}
          </h2>
          <p className="text-sm text-[var(--textSecondary)]">
            {t('games.chess_v1.puzzleRush.subtitle')}
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button
            type="button"
            onClick={() => handleStart('survival')}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-base font-bold cursor-pointer hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            {t('games.chess_v1.puzzleRush.survival')}
          </button>
          <button
            type="button"
            onClick={() => handleStart('timed')}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-base font-bold cursor-pointer hover:from-sky-600 hover:to-indigo-600 transition-all shadow-lg shadow-sky-500/20"
          >
            {t('games.chess_v1.puzzleRush.timed')}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="flex flex-col items-center gap-4 p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-black text-[var(--color)]">
          {t('games.chess_v1.puzzleRush.gameOver')}
        </h2>
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="flex flex-col items-center p-3 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)]">
            <span className="text-3xl font-black text-[var(--color)]">{score}</span>
            <span className="text-[10px] text-[var(--textSecondary)]">Score</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)]">
            <span className="text-3xl font-black text-orange-400">{bestStreak}</span>
            <span className="text-[10px] text-[var(--textSecondary)]">Best Streak</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)]">
            <span className="text-3xl font-black text-sky-400">{totalTime}s</span>
            <span className="text-[10px] text-[var(--textSecondary)]">Time</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)]">
            <span className="text-3xl font-black text-purple-400">{rating}</span>
            <span className="text-[10px] text-[var(--textSecondary)]">Rating</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPhase('menu')}
          className="w-full py-3 px-6 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--primary)] text-sm font-bold cursor-pointer hover:bg-[var(--primary)]/25 transition-colors"
        >
          {t('games.chess_v1.puzzleRush.playAgain')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-3 w-full max-w-[900px] mx-auto p-3">
      <div className="flex flex-col gap-2 md:flex-none md:w-[min(70vmin,560px)] md:sticky md:top-3">
        <PuzzleBoard
          puzzle={puzzle!}
          phase={puzzlePhase}
          onMove={handleMove}
        />
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
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
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
          className="w-full py-2 px-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-semibold cursor-pointer hover:bg-red-500/25 transition-colors"
        >
          {t('games.chess_v1.puzzleRush.endRun')}
        </button>
      </div>
    </div>
  );
}
