'use client';

import { memo, useMemo } from 'react';
import type { RatingHistoryEntry } from '@/features/chess/lib/puzzle-rating';

interface PuzzleRatingChartProps {
  history: RatingHistoryEntry[];
  currentRating: number;
}

function PuzzleRatingChartImpl({
  history,
  currentRating,
}: PuzzleRatingChartProps) {
  const chartData = useMemo(() => {
    if (history.length === 0) {
      return {
        points: [],
        minRating: 1200,
        maxRating: 1200,
        pathD: '',
        areaD: '',
        peak: currentRating,
      };
    }

    const ratings = history.map((h) => h.rating);
    const minRating = Math.min(...ratings, currentRating) - 20;
    const maxRating = Math.max(...ratings, currentRating) + 20;
    const range = Math.max(1, maxRating - minRating);

    const width = 400;
    const height = 140;
    const paddingX = 16;
    const paddingY = 16;

    const points = history.map((entry, idx) => {
      const x =
        history.length === 1
          ? width / 2
          : paddingX + (idx / (history.length - 1)) * (width - 2 * paddingX);
      const y =
        height -
        paddingY -
        ((entry.rating - minRating) / range) * (height - 2 * paddingY);
      return { x, y, entry };
    });

    const pathD = points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const firstPt = points[0];
    const lastPt = points[points.length - 1];
    const areaD =
      firstPt && lastPt
        ? `${pathD} L ${lastPt.x} ${height - paddingY} L ${firstPt.x} ${height - paddingY} Z`
        : '';

    return {
      points,
      minRating,
      maxRating,
      pathD,
      areaD,
      peak: Math.max(...ratings, currentRating),
    };
  }, [history, currentRating]);

  return (
    <div
      data-testid="puzzle-rating-chart"
      className="p-4 rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-[var(--textSecondary)] uppercase tracking-wider font-semibold">
            Tactical Elo Rating
          </div>
          <div className="text-2xl font-bold text-[var(--textPrimary)] flex items-center gap-2">
            <span>{currentRating}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              Peak {chartData.peak}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[var(--textSecondary)]">
            Puzzles Evaluated
          </div>
          <div className="text-sm font-semibold text-[var(--textPrimary)]">
            {history.length}
          </div>
        </div>
      </div>

      {chartData.points.length < 2 ? (
        <div className="h-32 flex items-center justify-center text-xs text-[var(--textSecondary)] border border-dashed border-[var(--glassBorder)] rounded-xl">
          Solve more rated puzzles to generate your tactical rating curve!
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox="0 0 400 140"
            className="w-full h-32 overflow-visible"
            aria-label="Rating trend curve"
          >
            <defs>
              <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {chartData.areaD && (
              <path d={chartData.areaD} fill="url(#ratingFill)" />
            )}

            {chartData.pathD && (
              <path
                d={chartData.pathD}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {chartData.points.map((pt, i) => (
              <circle
                key={pt.entry.timestamp + i}
                cx={pt.x}
                cy={pt.y}
                r={i === chartData.points.length - 1 ? 4 : 2.5}
                className={
                  pt.entry.solved
                    ? 'fill-emerald-400 stroke-zinc-900 stroke-2'
                    : 'fill-rose-500 stroke-zinc-900 stroke-2'
                }
              />
            ))}
          </svg>
        </div>
      )}

      {history.length > 0 && (
        <div className="flex items-center justify-between text-[11px] text-[var(--textSecondary)] pt-1 border-t border-[var(--glassBorder)]">
          <span>Recent:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[280px]">
            {history.slice(-8).map((h, idx) => (
              <span
                key={h.timestamp + idx}
                className={
                  h.solved
                    ? 'px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]'
                    : 'px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono text-[10px]'
                }
              >
                {h.change > 0 ? `+${h.change}` : h.change}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const PuzzleRatingChart = memo(PuzzleRatingChartImpl);
