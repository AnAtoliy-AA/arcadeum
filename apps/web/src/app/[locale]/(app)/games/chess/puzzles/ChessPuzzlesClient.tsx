'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@arcadeum/ui';
import { PuzzleGame } from '@/widgets/BoardGames/ChessPuzzles/ui/Game';
import { ChessPuzzleTabs } from '@/widgets/BoardGames/ChessPuzzles/ui/ChessPuzzleTabs';
import {
  THEME_CATEGORIES,
  type ChessPuzzle,
} from '@/features/chess/lib/puzzle-api';
import { removeMistakeFromQueue } from '@/features/chess/lib/puzzle-analytics';
import { cx } from '@arcadeum/ui/utils/cx';

const PuzzleAnalyticsModal = dynamic(
  () =>
    import('@/widgets/BoardGames/ChessPuzzles/ui/PuzzleAnalyticsModal').then(
      (m) => m.PuzzleAnalyticsModal,
    ),
  { ssr: false },
);

interface ChessPuzzlesClientProps {
  locale: string;
}

export function ChessPuzzlesClient({ locale }: ChessPuzzlesClientProps) {
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [reviewPuzzle, setReviewPuzzle] = useState<ChessPuzzle | null>(null);

  const handleMistakeSolved = (res: { puzzle: ChessPuzzle }) => {
    removeMistakeFromQueue(res.puzzle.puzzleId);
  };

  return (
    <>
      <ChessPuzzleTabs
        activeTab="rated"
        locale={locale}
        onOpenAnalytics={() => setAnalyticsOpen(true)}
      />

      {reviewPuzzle ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-xs font-semibold text-amber-300">
              Reviewing Missed Tactic:{' '}
              {reviewPuzzle.openingTags?.[0] || 'Puzzle'} ({reviewPuzzle.rating}
              )
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setReviewPuzzle(null)}
              data-testid="exit-review-mode-btn"
            >
              ← Back to Rated
            </Button>
          </div>
          <PuzzleGame
            key={reviewPuzzle.puzzleId}
            mode="custom"
            customPuzzle={reviewPuzzle}
            onSolved={handleMistakeSolved}
          />
        </div>
      ) : (
        <>
          <div
            data-testid="puzzle-theme-filters"
            className="flex items-center justify-center gap-1.5 flex-wrap mb-6 max-w-2xl mx-auto"
          >
            {THEME_CATEGORIES.map((cat) => {
              const isActive = selectedTheme === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedTheme(cat.id)}
                  data-testid={`theme-chip-${cat.id}`}
                  className={cx(
                    'px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150',
                    isActive
                      ? 'bg-[var(--primary)] text-white shadow-sm'
                      : 'bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)] hover:text-[var(--foreground)]',
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <PuzzleGame
            key={selectedTheme}
            mode={selectedTheme === 'all' ? 'rated' : 'themed'}
            theme={selectedTheme === 'all' ? undefined : selectedTheme}
          />
        </>
      )}

      {analyticsOpen && (
        <PuzzleAnalyticsModal
          isOpen={analyticsOpen}
          onClose={() => setAnalyticsOpen(false)}
          onTrainTheme={(theme) => setSelectedTheme(theme)}
          onReviewMistake={(p) => setReviewPuzzle(p)}
        />
      )}
    </>
  );
}
