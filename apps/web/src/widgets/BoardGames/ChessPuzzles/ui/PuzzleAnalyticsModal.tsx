'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button, ProgressBar } from '@arcadeum/ui';
import {
  getPuzzleAnalytics,
  loadMistakesQueue,
  removeMistakeFromQueue,
  clearMistakesQueue,
  type ThemeStat,
} from '@/features/chess/lib/puzzle-analytics';
import type { ChessPuzzle } from '@/features/chess/lib/puzzle-api';

interface PuzzleAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrainTheme?: (theme: string) => void;
  onReviewMistake?: (puzzle: ChessPuzzle) => void;
}

export function PuzzleAnalyticsModal({
  isOpen,
  onClose,
  onTrainTheme,
  onReviewMistake,
}: PuzzleAnalyticsModalProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'mistakes'>(
    'analytics',
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const { overall, themeBreakdown, weakestTheme } = useMemo(() => {
    void refreshKey;
    return getPuzzleAnalytics();
  }, [refreshKey]);

  const mistakes = useMemo(() => {
    void refreshKey;
    return loadMistakesQueue();
  }, [refreshKey]);

  const overallAccuracy = useMemo(() => {
    if (overall.totalAttempts === 0) return 0;
    return Math.round((overall.totalSolved / overall.totalAttempts) * 100);
  }, [overall]);

  const handleClearMistakes = useCallback(() => {
    clearMistakesQueue();
    setRefreshKey((k) => k + 1);
  }, []);

  const handleDismissMistake = useCallback((id: string) => {
    removeMistakeFromQueue(id);
    setRefreshKey((k) => k + 1);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      data-testid="puzzle-analytics-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[var(--background)] border border-[var(--glassBorder)] p-6 shadow-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-[var(--glassBorder)] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--color)]">
              Tactical Performance & Analytics
            </h2>
            <p className="text-xs text-[var(--textSecondary)] mt-0.5">
              Motif accuracy profiler, streak records, and mistakes review queue
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--textSecondary)] hover:text-[var(--color)] p-1 rounded-lg text-lg"
            data-testid="close-analytics-modal"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-[var(--glassBorder)] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            data-testid="tab-analytics"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'analytics'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)]'
            }`}
          >
            Tactical Radar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mistakes')}
            data-testid="tab-mistakes"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'mistakes'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)]'
            }`}
          >
            <span>Mistakes Queue</span>
            {mistakes.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500/20 text-red-400 font-bold">
                {mistakes.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'analytics' ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
                <div className="text-[10px] text-[var(--textSecondary)] font-medium">
                  Total Solved
                </div>
                <div className="text-xl font-bold text-emerald-400 mt-0.5">
                  {overall.totalSolved} / {overall.totalAttempts}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
                <div className="text-[10px] text-[var(--textSecondary)] font-medium">
                  Overall Accuracy
                </div>
                <div className="text-xl font-bold text-[var(--accent)] mt-0.5">
                  {overallAccuracy}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
                <div className="text-[10px] text-[var(--textSecondary)] font-medium">
                  Current Streak
                </div>
                <div className="text-xl font-bold text-amber-400 mt-0.5">
                  🔥 {overall.currentStreak}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
                <div className="text-[10px] text-[var(--textSecondary)] font-medium">
                  Best Streak
                </div>
                <div className="text-xl font-bold text-amber-300 mt-0.5">
                  ⚡ {overall.bestStreak}
                </div>
              </div>
            </div>

            {weakestTheme && (
              <div
                data-testid="weakest-theme-card"
                className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 flex-wrap"
              >
                <div>
                  <div className="text-xs font-bold text-amber-400">
                    Target Weakness Detected: {weakestTheme}
                  </div>
                  <div className="text-[11px] text-[var(--textSecondary)] mt-0.5">
                    Your accuracy on {weakestTheme} tactics is currently lower
                    than other motifs.
                  </div>
                </div>
                {onTrainTheme && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onTrainTheme(weakestTheme);
                      onClose();
                    }}
                    data-testid="train-weakness-btn"
                  >
                    Train {weakestTheme} →
                  </Button>
                )}
              </div>
            )}

            <div>
              <div className="text-xs font-bold text-[var(--color)] mb-2">
                Motif Accuracy Breakdown
              </div>
              {themeBreakdown.length === 0 ? (
                <div className="text-xs text-[var(--textSecondary)] text-center py-6 bg-[var(--glassBg)] rounded-xl">
                  Solve rated or daily puzzles to generate your tactical radar!
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {themeBreakdown.map((item: ThemeStat) => (
                    <div
                      key={item.theme}
                      className="p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-[var(--color)]">
                        <span>{item.theme}</span>
                        <span>
                          {item.solved}/{item.attempts} ({item.accuracy}%)
                        </span>
                      </div>
                      <ProgressBar value={item.accuracy} height={6} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-[var(--textSecondary)]">
                {mistakes.length} puzzle{mistakes.length === 1 ? '' : 's'} to
                review
              </div>
              {mistakes.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearMistakes}
                  data-testid="clear-mistakes-btn"
                >
                  Clear Queue
                </Button>
              )}
            </div>

            {mistakes.length === 0 ? (
              <div
                data-testid="empty-mistakes-state"
                className="text-center py-10 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] flex flex-col items-center justify-center gap-2"
              >
                <div className="text-3xl">🎯</div>
                <div className="text-sm font-bold text-emerald-400">
                  Clean Slate! No Missed Tactics
                </div>
                <div className="text-xs text-[var(--textSecondary)] max-w-xs">
                  Any puzzle you miss during rated play will automatically
                  appear here for spaced repetition.
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {mistakes.map((record) => (
                  <div
                    key={record.puzzle.puzzleId}
                    data-testid={`mistake-card-${record.puzzle.puzzleId}`}
                    className="p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-[var(--color)]">
                        {record.puzzle.openingTags?.[0] || 'Missed Tactic'}
                      </div>
                      <div className="text-[11px] text-[var(--textSecondary)] mt-0.5">
                        Rating: {record.puzzle.rating} · Themes:{' '}
                        {record.puzzle.themes.join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onReviewMistake && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            onReviewMistake(record.puzzle);
                            onClose();
                          }}
                          data-testid={`review-mistake-btn-${record.puzzle.puzzleId}`}
                        >
                          Retry Now
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleDismissMistake(record.puzzle.puzzleId)
                        }
                        data-testid={`dismiss-mistake-btn-${record.puzzle.puzzleId}`}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
