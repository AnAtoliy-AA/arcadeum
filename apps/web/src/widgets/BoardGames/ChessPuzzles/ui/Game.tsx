'use client';

import { memo, useCallback, useState, useRef, useMemo, useEffect } from 'react';
import { usePuzzleState } from '../hooks/usePuzzleState';
import { usePuzzleShortcuts } from '../hooks/usePuzzleShortcuts';
import { PuzzleBoard } from './PuzzleBoard';
import { PuzzleControls } from './PuzzleControls';
import type { ChessPuzzle } from '@/features/chess/lib/puzzle-api';
import {
  getSavedBlindfoldPreference,
  saveBlindfoldPreference,
  transformBoardForBlindfold,
} from '@/features/chess/lib/blindfold-mode';

interface PuzzleGameProps {
  mode?: 'daily' | 'rated' | 'themed' | 'custom';
  customPuzzle?: ChessPuzzle;
  theme?: string;
  date?: Date | string;
  onSolved?: (result: {
    puzzle: ChessPuzzle;
    moves: string[];
    timeMs: number;
  }) => void;
  onShare?: () => void;
}

function PuzzleGameImpl({
  mode = 'rated',
  customPuzzle,
  theme,
  date,
  onSolved,
  onShare,
}: PuzzleGameProps) {
  const [zenMode, setZenMode] = useState(false);
  const [blindfold, setBlindfold] = useState(() =>
    getSavedBlindfoldPreference(),
  );
  const [isPeeking, setIsPeeking] = useState(false);
  const peekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
    };
  }, []);

  const {
    puzzle,
    board,
    playerColor,
    phase,
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
    isFlipped,
    toggleFlipBoard,
  } = usePuzzleState({ mode, customPuzzle, theme, date, onSolved });

  const handleNext = useCallback(() => {
    void loadPuzzle();
  }, [loadPuzzle]);

  const toggleZen = useCallback(() => {
    setZenMode((prev) => !prev);
  }, []);

  const toggleBlindfold = useCallback(() => {
    setBlindfold((prev) => {
      const next = !prev;
      saveBlindfoldPreference(next);
      return next;
    });
  }, []);

  const handlePeek = useCallback(() => {
    if (!blindfold) return;
    setIsPeeking(true);
    if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
    peekTimerRef.current = setTimeout(() => {
      setIsPeeking(false);
      peekTimerRef.current = null;
    }, 2000);
  }, [blindfold]);

  usePuzzleShortcuts({
    enabled: true,
    onNext: phase === 'solved' || phase === 'failed' ? handleNext : undefined,
    onRetry: retry,
    onHint: showHint,
    onShowSolution: showSolution,
    onToggleZen: toggleZen,
    onFlipBoard: toggleFlipBoard,
    onToggleBlindfold: toggleBlindfold,
    onPeek: handlePeek,
  });

  const displayBoard = useMemo(() => {
    return transformBoardForBlindfold(board, blindfold, isPeeking);
  }, [board, blindfold, isPeeking]);

  if (loading && !puzzle) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[var(--textSecondary)] text-sm">
          Loading puzzle...
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[var(--textSecondary)] text-sm">
          No puzzles available
        </div>
      </div>
    );
  }

  const boardOrientColor = isFlipped
    ? playerColor === 'white'
      ? 'black'
      : 'white'
    : playerColor;

  return (
    <div
      className={
        zenMode
          ? 'flex flex-col items-center gap-3 w-full max-w-[700px] mx-auto p-3'
          : 'flex flex-col md:flex-row md:items-start gap-3 w-full max-w-[900px] mx-auto p-3'
      }
    >
      <div className="flex flex-col gap-2 md:flex-none md:w-[min(70vmin,560px)] md:sticky md:top-3">
        <div className="flex items-center justify-between text-xs text-[var(--textSecondary)] px-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={toggleFlipBoard}
              data-testid="flip-board-btn"
              className="px-2 py-0.5 rounded bg-[var(--glassBg)] border border-[var(--glassBorder)] hover:bg-[var(--backgroundHover)] text-[11px] font-medium transition-colors"
            >
              Flip [F]
            </button>
            <button
              type="button"
              onClick={toggleZen}
              data-testid="toggle-zen-btn"
              className="px-2 py-0.5 rounded bg-[var(--glassBg)] border border-[var(--glassBorder)] hover:bg-[var(--backgroundHover)] text-[11px] font-medium transition-colors"
            >
              {zenMode ? 'Exit Zen [Z]' : 'Zen Mode [Z]'}
            </button>
            <button
              type="button"
              onClick={toggleBlindfold}
              data-testid="toggle-blindfold-btn"
              className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-colors ${
                blindfold
                  ? 'bg-purple-600/20 text-purple-400 border-purple-500/40'
                  : 'bg-[var(--glassBg)] border-[var(--glassBorder)] hover:bg-[var(--backgroundHover)]'
              }`}
            >
              {blindfold ? 'Blindfold [B] ON' : 'Blindfold [B]'}
            </button>
            {blindfold && (
              <button
                type="button"
                onClick={handlePeek}
                data-testid="peek-blindfold-btn"
                className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-colors ${
                  isPeeking
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                }`}
              >
                {isPeeking ? 'Peeking...' : 'Peek [P]'}
              </button>
            )}
          </div>
          {phase === 'solved' && (
            <span className="font-semibold text-emerald-400 animate-pulse">
              🎉 Solved!
            </span>
          )}
        </div>

        {blindfold && (
          <div
            data-testid="blindfold-banner"
            className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/25 text-[11px] text-purple-300 flex items-center justify-between"
          >
            <span>Mental Visualization Active: Pieces Hidden</span>
            <span className="text-[10px] text-purple-400">
              Press [P] or click Peek to reveal briefly
            </span>
          </div>
        )}

        <div
          className={
            phase === 'solved'
              ? 'rounded-2xl ring-4 ring-emerald-500/50 shadow-[0_0_35px_rgba(16,185,129,0.35)] transition-all duration-300'
              : 'rounded-2xl transition-all duration-300'
          }
        >
          <PuzzleBoard
            puzzle={puzzle}
            phase={phase}
            onMove={makeMove}
            board={displayBoard}
            playerColor={boardOrientColor}
            selectedSquare={selectedSquare}
            legalMoves={legalDestinations}
            lastMove={lastMove}
            hintMove={hintMove}
            isCheck={isCheck}
            kingPosition={kingPosition}
            onSelectSquare={selectSquare}
          />
        </div>
      </div>

      <div
        className={
          zenMode
            ? 'w-full max-w-[420px] flex flex-col gap-3'
            : 'flex flex-col gap-3 flex-1 min-w-0 md:max-w-[280px]'
        }
      >
        <PuzzleControls
          phase={phase}
          rating={puzzle.rating}
          ratingChange={result?.ratingChange}
          mode={mode}
          onNext={handleNext}
          onRetry={retry}
          onShowSolution={showSolution}
          onHint={showHint}
          onShare={onShare}
        />

        {!zenMode && puzzle.themes.length > 0 && (
          <div className="p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
            <div className="text-[10px] font-semibold text-[var(--textSecondary)] uppercase tracking-wider mb-1">
              Themes
            </div>
            <div className="flex flex-wrap gap-1">
              {puzzle.themes.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-[10px] text-[var(--textSecondary)]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const PuzzleGame = memo(PuzzleGameImpl);
