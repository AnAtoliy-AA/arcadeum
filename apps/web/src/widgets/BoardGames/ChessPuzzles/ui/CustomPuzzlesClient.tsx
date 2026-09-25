'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@arcadeum/ui';
import { ChessPuzzleTabs } from './ChessPuzzleTabs';
import { CustomPuzzleCreator } from './CustomPuzzleCreator';
import { CustomPuzzleList } from './CustomPuzzleList';
import { PgnPuzzleImporter } from './PgnPuzzleImporter';
import { PuzzleGame } from './Game';
import {
  loadCustomPuzzles,
  decodePuzzleShare,
} from '@/features/chess/lib/custom-puzzles';
import type { ChessPuzzle } from '@/features/chess/lib/puzzle-api';

interface CustomPuzzlesClientProps {
  locale: string;
}

type ViewState = 'list' | 'create' | 'play' | 'pgn';

export function CustomPuzzlesClient({ locale }: CustomPuzzlesClientProps) {
  const searchParams = useSearchParams();
  const [puzzles, setPuzzles] = useState<ChessPuzzle[]>(() =>
    loadCustomPuzzles(),
  );
  const [activePuzzle, setActivePuzzle] = useState<ChessPuzzle | null>(() => {
    const sharedCode = searchParams?.get('puzzle');
    return sharedCode ? decodePuzzleShare(sharedCode) : null;
  });
  const [view, setView] = useState<ViewState>(() => {
    const sharedCode = searchParams?.get('puzzle');
    return sharedCode && decodePuzzleShare(sharedCode) ? 'play' : 'list';
  });

  const refreshPuzzles = useCallback(() => {
    const list = loadCustomPuzzles();
    setPuzzles(list);
  }, []);

  const handlePuzzleCreated = useCallback(
    (newPuzzle: ChessPuzzle) => {
      refreshPuzzles();
      setActivePuzzle(newPuzzle);
      setView('play');
    },
    [refreshPuzzles],
  );

  const handlePlayPuzzle = useCallback((puzzle: ChessPuzzle) => {
    setActivePuzzle(puzzle);
    setView('play');
  }, []);

  const handleBackToList = useCallback(() => {
    setActivePuzzle(null);
    setView('list');
  }, []);

  return (
    <main className="flex flex-col items-center min-h-screen py-6">
      <div className="w-full max-w-[900px] px-4">
        <div className="flex flex-col items-center text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color)] mb-2">
            Custom Chess Puzzles
          </h1>
          <p className="text-sm text-[var(--textSecondary)] max-w-md">
            Design your own tactical positions, practice solving custom
            compositions, and share them directly with anyone.
          </p>
        </div>

        <ChessPuzzleTabs activeTab="custom" locale={locale} />

        {view === 'create' && (
          <CustomPuzzleCreator
            onPuzzleCreated={handlePuzzleCreated}
            onCancel={handleBackToList}
          />
        )}

        {view === 'pgn' && (
          <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-md">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBackToList}
                data-testid="back-from-pgn-btn"
              >
                ← Back to Custom Puzzles
              </Button>
            </div>
            <PgnPuzzleImporter onImportSuccess={refreshPuzzles} />
          </div>
        )}

        {view === 'list' && (
          <CustomPuzzleList
            puzzles={puzzles}
            locale={locale}
            onPlay={handlePlayPuzzle}
            onCreateNew={() => setView('create')}
            onImportPgn={() => setView('pgn')}
            onRefresh={refreshPuzzles}
          />
        )}

        {view === 'play' && activePuzzle && (
          <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-md">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBackToList}
                data-testid="back-to-custom-puzzles-btn"
              >
                ← Back to Custom Puzzles
              </Button>
              <div className="text-xs font-semibold text-[var(--color)]">
                {activePuzzle.openingTags?.[0] || 'Custom Puzzle'} (
                {activePuzzle.rating})
              </div>
            </div>

            <PuzzleGame
              key={activePuzzle.puzzleId}
              mode="custom"
              customPuzzle={activePuzzle}
            />
          </div>
        )}
      </div>
    </main>
  );
}
