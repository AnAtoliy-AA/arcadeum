'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { cx } from '@arcadeum/ui/utils/cx';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import { analyzeGame } from '../lib/analyzeGame';
import type { MoveQuality } from '../lib/analyzeGame';
import { MoveTimeline } from './MoveTimeline';

// recharts is heavy; keep it out of the chess game chunk (same pattern as
// MarketCapSparkline on the token page).
const EvalGraph = dynamic(
  () => import('./EvalGraph').then((m) => m.EvalGraph),
  {
    ssr: false,
    loading: () => (
      <div className="h-[180px] w-full animate-pulse rounded-lg bg-[rgba(255,255,255,0.04)]" />
    ),
  },
);

interface PostGameAnalysisProps {
  /** FEN per ply including the initial position. */
  positionHistory: string[];
  /** Short algebraic notation per move, for the timeline. */
  notations?: string[];
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const SUMMARY_COLORS = {
  inaccuracy: 'text-[#f59e0b] border-[rgba(245,158,11,0.35)]',
  mistake: 'text-[#f97316] border-[rgba(249,115,22,0.35)]',
  blunder: 'text-[#ef4444] border-[rgba(239,68,68,0.35)]',
} as const;

export function PostGameAnalysis({
  positionHistory,
  notations,
  t,
}: PostGameAnalysisProps) {
  const analysis = useMemo(
    () => analyzeGame(positionHistory, notations),
    [positionHistory, notations],
  );

  const qualityLabels = useMemo<Record<MoveQuality, string>>(
    () => ({
      good: t('games.chess_v1.analysis.quality.good'),
      inaccuracy: t('games.chess_v1.analysis.quality.inaccuracy'),
      mistake: t('games.chess_v1.analysis.quality.mistake'),
      blunder: t('games.chess_v1.analysis.quality.blunder'),
    }),
    [t],
  );

  const unitLabel = t('games.chess_v1.analysis.centipawns');

  if (analysis.moves.length === 0) {
    return (
      <div className="flex w-full flex-col items-center gap-3 py-6">
        <span className="text-3xl">📊</span>
        <p className="text-center text-[14px] text-[rgba(255,255,255,0.6)]">
          {t('games.chess_v1.analysis.empty')}
        </p>
      </div>
    );
  }

  const finalEval = analysis.finalEval;

  const summary = [
    {
      label: t('games.chess_v1.analysis.summary.inaccuracies'),
      count: analysis.inaccuracies.length,
      color: SUMMARY_COLORS.inaccuracy,
    },
    {
      label: t('games.chess_v1.analysis.summary.mistakes'),
      count: analysis.mistakes.length,
      color: SUMMARY_COLORS.mistake,
    },
    {
      label: t('games.chess_v1.analysis.summary.blunders'),
      count: analysis.blunders.length,
      color: SUMMARY_COLORS.blunder,
    },
  ];

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[16px] font-bold text-[rgba(255,255,255,0.9)]">
          {t('games.chess_v1.analysis.title')}
        </h2>
        <span className="rounded-md border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] px-2 py-1 text-[11px] font-semibold text-[rgba(255,255,255,0.7)]">
          {t('games.chess_v1.analysis.summary.finalEval')}:{' '}
          <span
            className={finalEval >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}
          >
            {finalEval > 0 ? '+' : ''}
            {finalEval}
            {unitLabel}
          </span>
        </span>
      </div>

      <EvalGraph
        evals={analysis.evals}
        turningPointPly={analysis.turningPoint?.ply ?? null}
        unitLabel={unitLabel}
        whiteLabel={t('games.chess_v1.status.white')}
        blackLabel={t('games.chess_v1.status.black')}
        ariaLabel={t('games.chess_v1.analysis.title')}
      />

      <div className="flex flex-wrap items-center gap-2">
        {summary.map((item) => (
          <span
            key={item.label}
            className={cx(
              'rounded-md border bg-[rgba(255,255,255,0.03)] px-2.5 py-1 text-[12px] font-semibold',
              item.color,
            )}
          >
            {item.label}: {item.count}
          </span>
        ))}
        {analysis.turningPoint && (
          <span className="rounded-md border border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.08)] px-2.5 py-1 text-[12px] font-semibold text-[#f59e0b]">
            {t('games.chess_v1.analysis.summary.turningPoint')}:{' '}
            {analysis.turningPoint.notation ||
              `${analysis.turningPoint.moveNumber}.`}
          </span>
        )}
      </div>

      <MoveTimeline
        moves={analysis.moves}
        qualityLabels={qualityLabels}
        unitLabel={unitLabel}
      />
    </div>
  );
}
