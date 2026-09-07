'use client';

import { memo, useCallback } from 'react';
import { usePuzzleState } from '../hooks/usePuzzleState';
import { PuzzleBoard } from './PuzzleBoard';
import { PuzzleControls } from './PuzzleControls';

interface PuzzleGameProps {
  mode?: 'daily' | 'rated' | 'themed';
  theme?: string;
}

function PuzzleGameImpl({ mode = 'rated', theme }: PuzzleGameProps) {
  const { puzzle, phase, result, loading, loadPuzzle, makeMove } =
    usePuzzleState({ mode, theme });

  const handleNext = useCallback(() => {
    loadPuzzle();
  }, [loadPuzzle]);

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

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-3 w-full max-w-[900px] mx-auto p-3">
      <div className="flex flex-col gap-2 md:flex-none md:w-[min(70vmin,560px)] md:sticky md:top-3">
        <PuzzleBoard
          puzzle={puzzle}
          phase={phase}
          onMove={makeMove}
        />
      </div>

      <div className="flex flex-col gap-3 flex-1 min-w-0 md:max-w-[280px]">
        <PuzzleControls
          phase={phase}
          rating={puzzle.rating}
          ratingChange={result?.ratingChange}
          onNext={handleNext}
        />

        {puzzle.themes.length > 0 && (
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
