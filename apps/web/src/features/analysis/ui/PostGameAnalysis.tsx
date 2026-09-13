'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { cx } from '@arcadeum/ui/utils/cx';
import type { TranslationKey } from '@/shared/i18n/useTranslation';
import { analyzeGame, type MoveQuality } from '../lib/analyzeGame';
import {
  analyzeGameWithStockfish,
  type GameAnalysisResult,
} from '../lib/stockfish-api';
import { MoveTimeline } from './MoveTimeline';

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
  positionHistory: string[];
  notations?: string[];
  myColor?: 'white' | 'black' | null;
  isSpectator?: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const SUMMARY_COLORS = {
  brilliant: 'text-[#06b6d4] border-[rgba(6,182,212,0.35)]',
  great: 'text-[#16a34a] border-[rgba(22,163,74,0.35)]',
  best: 'text-[#22c55e] border-[rgba(34,197,94,0.35)]',
  excellent: 'text-[#22c55e] border-[rgba(34,197,94,0.35)]',
  good: 'text-[#22c55e] border-[rgba(34,197,94,0.35)]',
  book: 'text-[#9ca3af] border-[rgba(156,163,175,0.35)]',
  inaccuracy: 'text-[#eab308] border-[rgba(234,179,8,0.35)]',
  mistake: 'text-[#f97316] border-[rgba(249,115,22,0.35)]',
  blunder: 'text-[#ef4444] border-[rgba(239,68,68,0.35)]',
} as const;

function getAccuracyGrade(accuracy: number): {
  grade: string;
  colorClass: string;
} {
  if (accuracy >= 95)
    return {
      grade: 'A+',
      colorClass:
        'text-[#10b981] border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.1)]',
    };
  if (accuracy >= 90)
    return {
      grade: 'A',
      colorClass:
        'text-[#22c55e] border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.1)]',
    };
  if (accuracy >= 80)
    return {
      grade: 'B',
      colorClass:
        'text-[#3b82f6] border-[rgba(59,130,246,0.35)] bg-[rgba(59,130,246,0.1)]',
    };
  if (accuracy >= 70)
    return {
      grade: 'C',
      colorClass:
        'text-[#f59e0b] border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.1)]',
    };
  return {
    grade: 'D',
    colorClass:
      'text-[#ef4444] border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.1)]',
  };
}

export function PostGameAnalysis({
  positionHistory,
  notations,
  myColor,
  isSpectator,
  t,
}: PostGameAnalysisProps) {
  const [stockfishResult, setStockfishResult] =
    useState<GameAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [spectatorPerspective, setSpectatorPerspective] = useState<
    'white' | 'black'
  >('white');

  const perspective = isSpectator ? spectatorPerspective : (myColor ?? 'white');
  const shouldFlip = perspective === 'black';

  const flipEvals = useCallback(
    (vals: (number | null)[]): (number | null)[] => {
      if (!shouldFlip) return vals;
      return vals.map((v) => (v != null ? -v : v));
    },
    [shouldFlip],
  );

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 60_000);

    analyzeGameWithStockfish(positionHistory, notations)
      .then((result) => {
        if (!cancelled) {
          clearTimeout(timeout);
          setStockfishResult(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearTimeout(timeout);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [positionHistory, notations]);

  const fallbackAnalysis = useMemo(
    () => analyzeGame(positionHistory, notations),
    [positionHistory, notations],
  );

  const evals = useMemo(() => {
    const raw = stockfishResult?.evals ?? fallbackAnalysis.evals;
    const flipped = flipEvals(raw);
    return flipped.map((v) => v ?? 0);
  }, [stockfishResult, fallbackAnalysis.evals, flipEvals]);

  const moves = useMemo(() => {
    const raw =
      stockfishResult?.moves ??
      fallbackAnalysis.moves.map((m) => ({
        quality: m.quality as MoveQuality,
        move: m.notation,
        evalAfter: m.evalAfter,
        mateAfter: null as number | null,
        loss: m.loss,
        bestMove: '',
        bestPv: [] as string[],
      }));
    return raw.map((m, i) => ({
      ply: i,
      moveNumber: Math.floor(i / 2) + 1,
      color: (i % 2 === 0 ? 'white' : 'black') as 'white' | 'black',
      notation: m.move,
      evalAfter: flipEvals([m.evalAfter])[0] ?? 0,
      delta:
        i > 0
          ? (flipEvals([m.evalAfter])[0] ?? 0) -
            (flipEvals([raw[i - 1]?.evalAfter ?? 0])[0] ?? 0)
          : 0,
      loss: m.loss,
      quality: m.quality,
    }));
  }, [stockfishResult, fallbackAnalysis.moves, flipEvals]);

  const inaccuracies = moves.filter((m) => m.quality === 'inaccuracy');
  const mistakes = moves.filter((m) => m.quality === 'mistake');
  const blunders = moves.filter((m) => m.quality === 'blunder');
  const brilliants = moves.filter((m) => m.quality === 'brilliant');
  const greats = moves.filter((m) => m.quality === 'great');
  const bests = moves.filter((m) => m.quality === 'best');
  const excellents = moves.filter((m) => m.quality === 'excellent');
  const books = moves.filter((m) => m.quality === 'book');

  const turningPoint = (() => {
    let max = -1;
    let tp: (typeof moves)[0] | null = null;
    for (const m of moves) {
      if (m.loss > max) {
        max = m.loss;
        tp = m;
      }
    }
    return tp;
  })();
  const finalEval = evals[evals.length - 1] ?? 0;

  const whiteAccuracy = stockfishResult?.whiteAccuracy ?? null;
  const blackAccuracy = stockfishResult?.blackAccuracy ?? null;
  const whiteGrade =
    whiteAccuracy != null ? getAccuracyGrade(whiteAccuracy) : null;
  const blackGrade =
    blackAccuracy != null ? getAccuracyGrade(blackAccuracy) : null;

  const qualityLabels = useMemo<Record<MoveQuality, string>>(
    () => ({
      brilliant: 'Brilliant',
      great: 'Great',
      best: 'Best',
      excellent: 'Excellent',
      good: 'Good',
      book: 'Book',
      inaccuracy: 'Inaccuracy',
      mistake: 'Mistake',
      blunder: 'Blunder',
    }),
    [],
  );

  const unitLabel = t('games.chess_v1.analysis.centipawns');

  if (moves.length === 0) {
    return (
      <div className="flex w-full flex-col items-center gap-3 py-6">
        <span className="text-3xl">📊</span>
        <p className="text-center text-[14px] text-[rgba(255,255,255,0.6)]">
          {t('games.chess_v1.analysis.empty')}
        </p>
      </div>
    );
  }

  const summary = [
    ...(brilliants.length > 0
      ? [
          {
            label: 'Brilliant',
            count: brilliants.length,
            color: SUMMARY_COLORS.brilliant,
          },
        ]
      : []),
    ...(greats.length > 0
      ? [
          {
            label: 'Great',
            count: greats.length,
            color: SUMMARY_COLORS.great,
          },
        ]
      : []),
    ...(bests.length > 0
      ? [
          {
            label: 'Best',
            count: bests.length,
            color: SUMMARY_COLORS.best,
          },
        ]
      : []),
    ...(excellents.length > 0
      ? [
          {
            label: 'Excellent',
            count: excellents.length,
            color: SUMMARY_COLORS.excellent,
          },
        ]
      : []),
    ...(books.length > 0
      ? [
          {
            label: 'Book',
            count: books.length,
            color: SUMMARY_COLORS.book,
          },
        ]
      : []),
    {
      label: t('games.chess_v1.analysis.summary.inaccuracies'),
      count: inaccuracies.length,
      color: SUMMARY_COLORS.inaccuracy,
    },
    {
      label: t('games.chess_v1.analysis.summary.mistakes'),
      count: mistakes.length,
      color: SUMMARY_COLORS.mistake,
    },
    {
      label: t('games.chess_v1.analysis.summary.blunders'),
      count: blunders.length,
      color: SUMMARY_COLORS.blunder,
    },
  ];

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-bold text-[var(--color)]">
            {t('games.chess_v1.analysis.title')}
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-[var(--textSecondary)] font-mono">
            {loading ? 'Stockfish 19 Depth 18...' : 'Stockfish 19 Evaluated'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isSpectator && (
            <button
              type="button"
              onClick={() =>
                setSpectatorPerspective((p) =>
                  p === 'white' ? 'black' : 'white',
                )
              }
              className="text-[10px] px-2 py-1 rounded bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:text-[var(--color)] cursor-pointer transition-colors"
            >
              {perspective === 'white' ? '♔ White' : '♚ Black'}
            </button>
          )}
          <span className="rounded-md border border-[var(--glassBorder)] bg-[var(--glassBg)] px-2 py-1 text-[11px] font-semibold text-[var(--textSecondary)]">
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
      </div>

      {whiteAccuracy != null && blackAccuracy != null && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[var(--color)] flex items-center gap-1.5">
                <span>♔</span> White Accuracy
              </span>
              {whiteGrade && (
                <span
                  className={cx(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded border',
                    whiteGrade.colorClass,
                  )}
                >
                  {whiteGrade.grade}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[20px] font-extrabold font-mono text-[var(--color)]">
                {whiteAccuracy.toFixed(1)}
              </span>
              <span className="text-[12px] text-[var(--textSecondary)]">%</span>
            </div>
            <svg
              className="w-full h-1.5 rounded overflow-hidden bg-[var(--backgroundHover)]"
              viewBox="0 0 100 6"
            >
              <rect
                x="0"
                y="0"
                width={Math.min(100, Math.max(0, whiteAccuracy))}
                height="6"
                rx="3"
                className="fill-[#3b82f6]"
              />
            </svg>
          </div>

          <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[var(--color)] flex items-center gap-1.5">
                <span>♚</span> Black Accuracy
              </span>
              {blackGrade && (
                <span
                  className={cx(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded border',
                    blackGrade.colorClass,
                  )}
                >
                  {blackGrade.grade}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[20px] font-extrabold font-mono text-[var(--color)]">
                {blackAccuracy.toFixed(1)}
              </span>
              <span className="text-[12px] text-[var(--textSecondary)]">%</span>
            </div>
            <svg
              className="w-full h-1.5 rounded overflow-hidden bg-[var(--backgroundHover)]"
              viewBox="0 0 100 6"
            >
              <rect
                x="0"
                y="0"
                width={Math.min(100, Math.max(0, blackAccuracy))}
                height="6"
                rx="3"
                className="fill-[#10b981]"
              />
            </svg>
          </div>
        </div>
      )}

      <EvalGraph
        evals={evals}
        turningPointPly={turningPoint?.ply ?? null}
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
              'rounded-md border border-[var(--glassBorder)] bg-[var(--glassBg)] px-2.5 py-1 text-[12px] font-semibold',
              item.color,
            )}
          >
            {item.label}: {item.count}
          </span>
        ))}
        {turningPoint && (
          <span className="rounded-md border border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.08)] px-2.5 py-1 text-[12px] font-semibold text-[#f59e0b]">
            {t('games.chess_v1.analysis.summary.turningPoint')}:{' '}
            {turningPoint.notation ||
              `${Math.floor(turningPoint.ply / 2) + 1}.`}
          </span>
        )}
      </div>

      <MoveTimeline
        moves={moves}
        qualityLabels={qualityLabels}
        unitLabel={unitLabel}
      />
    </div>
  );
}
