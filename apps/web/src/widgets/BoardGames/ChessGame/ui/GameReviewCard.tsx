'use client';

import { useMemo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

interface MoveClassification {
  type: 'brilliant' | 'great' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  count: number;
}

interface EvalPoint {
  moveIndex: number;
  eval: number;
  label: string;
}

interface PlayerReview {
  accuracy: number;
  grade: string;
  classifications: MoveClassification[];
  avgEvalLoss: number;
}

interface GameReviewCardProps {
  whiteReview: PlayerReview;
  blackReview: string[];
  evalHistory: EvalPoint[];
  keyMoments: EvalPoint[];
  t: (key: string, params?: Record<string, string | number>) => string;
}

const CLASSIFICATION_CONFIG: Record<
  string,
  { color: string; bg: string; symbol: string }
> = {
  brilliant: { color: 'text-purple-400', bg: 'bg-purple-500/15', symbol: '!!' },
  great: { color: 'text-sky-400', bg: 'bg-sky-500/15', symbol: '!' },
  good: { color: 'text-emerald-400', bg: 'bg-emerald-500/15', symbol: '' },
  inaccuracy: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    symbol: '?!',
  },
  mistake: { color: 'text-orange-400', bg: 'bg-orange-500/15', symbol: '?' },
  blunder: { color: 'text-red-400', bg: 'bg-red-500/15', symbol: '??' },
};

function getGradeFromAccuracy(accuracy: number): string {
  if (accuracy >= 95) return 'A+';
  if (accuracy >= 90) return 'A';
  if (accuracy >= 85) return 'B+';
  if (accuracy >= 80) return 'B';
  if (accuracy >= 75) return 'C+';
  if (accuracy >= 70) return 'C';
  if (accuracy >= 60) return 'D';
  return 'F';
}

function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-emerald-400';
  if (grade.startsWith('B')) return 'text-sky-400';
  if (grade.startsWith('C')) return 'text-amber-400';
  return 'text-red-400';
}

function AccuracyBar({ accuracy }: { accuracy: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-[var(--backgroundHover)] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${accuracy}%` }}
        />
      </div>
      <span className="text-xs font-bold text-[var(--color)] tabular-nums w-12 text-right">
        {accuracy.toFixed(1)}%
      </span>
    </div>
  );
}

function ClassificationBreakdown({
  classifications,
}: {
  classifications: MoveClassification[];
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {classifications.map((c) => {
        const config = CLASSIFICATION_CONFIG[c.type];
        return (
          <div
            key={c.type}
            className={cx(
              'flex flex-col items-center gap-0.5 p-1.5 rounded-lg',
              config.bg,
            )}
          >
            <span className={cx('text-xs font-bold', config.color)}>
              {c.count}
            </span>
            <span className="text-[9px] text-[var(--textSecondary)] capitalize">
              {c.type}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function EvalGraph({
  evalHistory,
  height = 80,
}: {
  evalHistory: EvalPoint[];
  height?: number;
}) {
  const maxAbs = useMemo(() => {
    let max = 1;
    for (const point of evalHistory) {
      const abs = Math.abs(point.eval);
      if (abs > max) max = abs;
    }
    return max;
  }, [evalHistory]);

  const points = useMemo(() => {
    if (evalHistory.length < 2) return '';
    const width = 100;
    const segW = width / (evalHistory.length - 1);
    return evalHistory
      .map((point, i) => {
        const x = i * segW;
        const normalized = point.eval / maxAbs;
        const y = height / 2 - normalized * (height / 2 - 4);
        return `${x},${y}`;
      })
      .join(' ');
  }, [evalHistory, maxAbs, height]);

  const fillPoints = useMemo(() => {
    if (evalHistory.length < 2) return '';
    const width = 100;
    const segW = width / (evalHistory.length - 1);
    const topPoints = evalHistory
      .map((point, i) => {
        const x = i * segW;
        const normalized = Math.max(0, point.eval / maxAbs);
        const y = height / 2 - normalized * (height / 2 - 4);
        return `${x},${y}`;
      })
      .join(' ');
    const bottomPoints = evalHistory
      .map((point, i) => {
        const x = i * segW;
        const normalized = Math.min(0, point.eval / maxAbs);
        const y = height / 2 - normalized * (height / 2 - 4);
        return `${x},${y}`;
      })
      .reverse()
      .join(' ');
    return `${topPoints} ${bottomPoints}`;
  }, [evalHistory, maxAbs, height]);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 100 ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          y1={height / 2}
          x2="100"
          y2={height / 2}
          stroke="rgba(148,163,184,0.2)"
          strokeWidth="0.5"
        />
        {fillPoints && (
          <polygon
            points={fillPoints}
            fill="rgba(99,102,241,0.1)"
          />
        )}
        {points && (
          <polyline
            points={points}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      <div className="flex justify-between text-[9px] text-[var(--textSecondary)] px-1">
        <span>White advantage</span>
        <span>Black advantage</span>
      </div>
    </div>
  );
}

export function GameReviewCard({
  whiteReview,
  blackReview,
  evalHistory,
  keyMoments,
  t,
}: GameReviewCardProps) {
  const whiteGrade = getGradeFromAccuracy(whiteReview.accuracy);
  const blackGrade = getGradeFromAccuracy(typeof blackReview === 'string' ? 50 : 50);

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
      <div className="text-[11px] font-semibold text-[var(--textSecondary)] uppercase tracking-wider">
        {t('games.chess_v1.review.title')}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)]">
          <span className="text-[10px] text-[var(--textSecondary)] font-medium">
            White
          </span>
          <span className={cx('text-3xl font-black', getGradeColor(whiteGrade))}>
            {whiteGrade}
          </span>
          <AccuracyBar accuracy={whiteReview.accuracy} />
        </div>
        <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)]">
          <span className="text-[10px] text-[var(--textSecondary)] font-medium">
            Black
          </span>
          <span className={cx('text-3xl font-black', getGradeColor(blackGrade))}>
            {blackGrade}
          </span>
          <AccuracyBar accuracy={typeof blackReview === 'string' ? 50 : 50} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold text-[var(--textSecondary)] uppercase">
          Move Breakdown
        </span>
        <ClassificationBreakdown classifications={whiteReview.classifications} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold text-[var(--textSecondary)] uppercase">
          Evaluation
        </span>
        <EvalGraph evalHistory={evalHistory} />
      </div>

      {keyMoments.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold text-[var(--textSecondary)] uppercase">
            Key Moments
          </span>
          <div className="flex flex-col gap-1">
            {keyMoments.map((moment, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[var(--backgroundHover)]"
              >
                <span className="text-[10px] text-[var(--textSecondary)] w-8">
                  {moment.moveIndex + 1}.
                </span>
                <span className="text-xs text-[var(--color)] font-medium">
                  {moment.label}
                </span>
                <span className="text-[10px] text-[var(--textSecondary)] ml-auto">
                  {moment.eval > 0 ? '+' : ''}
                  {(moment.eval / 100).toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
