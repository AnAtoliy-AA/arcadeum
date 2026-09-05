'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ChessPuzzle, PuzzleSolveResult } from '@/features/chess/lib/puzzle-api';
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

  const loadPuzzle = useCallback(async () => {
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
    loadedRef.current = true;
    void loadPuzzle();
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
        solvePuzzle(puzzle.puzzleId, newMoves, timeMs).then(setResult);
      }
    },
    [puzzle, phase, playerMoves],
  );

  const playOpponentMoves = useCallback(() => {
    if (!puzzle) return;
    // Puzzle starts with opponent's first move(s)
    // For simplicity, we show the position and let the player respond
    setPhase('player');
  }, [puzzle]);

  // Auto-play opponent moves on load
  useEffect(() => {
    if (phase === 'opponent' && puzzle) {
      const timer = setTimeout(() => {
        playOpponentMoves();
      }, 500);
      return () => clearTimeout(timer);
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
