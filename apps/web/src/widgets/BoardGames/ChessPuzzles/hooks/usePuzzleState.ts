'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  ChessPuzzle,
  PuzzleSolveResult,
} from '@/features/chess/lib/puzzle-api';
import {
  getRandomPuzzle,
  solvePuzzle,
  getDailyPuzzle,
} from '@/features/chess/lib/puzzle-api';

type PuzzlePhase = 'waiting' | 'opponent' | 'player' | 'solved' | 'failed';

interface UsePuzzleStateOptions {
  mode?: 'daily' | 'rated' | 'themed';
  theme?: string;
  rating?: number;
  onSolved?: (res: {
    puzzle: ChessPuzzle;
    moves: string[];
    timeMs: number;
  }) => void;
}

export function usePuzzleState(options: UsePuzzleStateOptions = {}) {
  const { mode = 'rated', theme, rating } = options;
  const [puzzle, setPuzzle] = useState<ChessPuzzle | null>(null);
  const [phase, setPhase] = useState<PuzzlePhase>('waiting');
  const [playerMoves, setPlayerMoves] = useState<string[]>([]);
  const [result, setResult] = useState<PuzzleSolveResult | null>(null);
  const [loading, setLoading] = useState(false);
  const startTimeRef = useRef<number>(0);
  const loadedRef = useRef(false);
  const mountedRef = useRef(false);

  const loadPuzzle = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    setPhase('waiting');
    setPlayerMoves([]);
    setResult(null);
    try {
      let p: ChessPuzzle | null = null;
      if (mode === 'daily') {
        p = await getDailyPuzzle();
      } else {
        p = await getRandomPuzzle(rating, theme);
      }
      setPuzzle(p);
      if (p) {
        setPhase('opponent');
        startTimeRef.current = Date.now();
      }
    } catch {
      setPuzzle(null);
    } finally {
      setLoading(false);
    }
  }, [mode, theme, rating]);

  // Load initial puzzle on mount (avoid sync setState in effect)
  useEffect(() => {
    if (loadedRef.current) return;
    mountedRef.current = true;
    loadedRef.current = true;
    void loadPuzzle();
    return () => {
      mountedRef.current = false;
    };
  }, [loadPuzzle]);

  const makeMove = useCallback(
    (moveUci: string) => {
      if (!puzzle || phase !== 'player') return;

      const newMoves = [...playerMoves, moveUci];
      setPlayerMoves(newMoves);

      const expectedMoves = puzzle.moves;
      const isCorrect =
        newMoves.length <= expectedMoves.length &&
        newMoves.every((m, i) => m === expectedMoves[i]);

      if (!isCorrect) {
        setPhase('failed');
        return;
      }

      if (newMoves.length === expectedMoves.length) {
        const timeMs = Date.now() - startTimeRef.current;
        setPhase('solved');
        options.onSolved?.({ puzzle, moves: newMoves, timeMs });
        solvePuzzle(puzzle.puzzleId, newMoves, timeMs)
          .then(setResult)
          .catch(() => {
            setResult({ solved: true, ratingChange: 10, puzzle });
          });
      }
    },
    [puzzle, phase, playerMoves, options],
  );

  const playOpponentMoves = useCallback(() => {
    if (!puzzle) return;
    setPhase('player');
  }, [puzzle]);

  useEffect(() => {
    if (phase === 'opponent' && puzzle) {
      const frameId = requestAnimationFrame(() => {
        playOpponentMoves();
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [phase, puzzle, playOpponentMoves]);

  return {
    puzzle,
    phase,
    playerMoves,
    result,
    loading,
    loadPuzzle,
    makeMove,
  };
}
