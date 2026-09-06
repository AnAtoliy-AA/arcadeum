'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { cx } from '@arcadeum/ui/utils/cx';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import { analyzeGame, type MoveQuality } from '../lib/analyzeGame';
import { analyzeGameWithStockfish, type GameAnalysisResult } from '../lib/stockfish-api';
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
  inaccuracy: 'text-[#f59e0b] border-[rgba(245,158,11,0.35)]',
  mistake: 'text-[#f97316] border-[rgba(249,115,22,0.35)]',
  blunder: 'text-[#ef4444] border-[rgba(239,68,68,0.35)]',
} as const;

export function PostGameAnalysis({
  positionHistory,
  notations,
  myColor,
  isSpectator,
  t,
}: PostGameAnalysisProps) {
  const [stockfishResult, setStockfishResult] = useState<GameAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [spectatorPerspective, setSpectatorPerspective] = useState<'white' | 'black'>('white');

  const perspective = isSpectator ? spectatorPerspective : (myColor ?? 'white');
  const shouldFlip = perspective === 'black';

  const flipEvals = useCallback((vals: (number | null)[]): (number | null)[] => {
    if (!shouldFlip) return vals;
    return vals.map((v) => (v != null ? -v : v));
  }, [shouldFlip]);

  useEffect(() => {
    let cancelled = false;
    analyzeGameWithStockfish(positionHistory, notations).then((result) => {
      if (!cancelled) {
        setStockfishResult(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [positionHistory, notations]);

  // Fallback to static evaluator if Stockfish fails
  const fallbackAnalysis = useMemo(
    () => analyzeGame(positionHistory, notations),
    [positionHistory, notations],
  );

  // Flip evals for player's perspective
  const evals = useMemo(() => {
    const raw = stockfishResult?.evals ?? fallbackAnalysis.evals;
    return flipEvals(raw);
  }, [stockfishResult, fallbackAnalysis.evals, flipEvals]);
  const moves = useMemo(() => {
    const raw = stockfishResult?.moves ?? fallbackAnalysis.moves.map((m) => ({
      quality: m.quality as MoveQuality,
      notation: m.notation,
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
      notation: m.notation,
      evalAfter: flipEvals([m.evalAfter])[0] ?? 0,
      delta: i > 0 ? (flipEvals([m.evalAfter])[0] ?? 0) - (flipEvals([raw[i - 1]?.evalAfter ?? 0])[0] ?? 0) : 0,
      loss: m.loss,
      quality: m.quality,
    }));
  }, [stockfishResult, fallbackAnalysis.moves, flipEvals]);
  const inaccuracies = moves.filter((m) => m.quality === 'inaccuracy');
  const mistakes = moves.filter((m) => m.quality === 'mistake');
  const blunders = moves.filter((m) => m.quality === 'blunder');
  const turningPoint = (() => {
    let max = -1;
    let tp: typeof moves[0] | null = null;
    for (const m of moves) {
      if (m.loss > max) { max = m.loss; tp = m; }
    }
    return tp;
  })();
  const finalEval = evals[evals.length - 1] ?? 0;

  const qualityLabels = useMemo<Record<MoveQuality, string>>(
    () => ({
      good: t('games.chess_v1.analysis.quality.good'),
      inaccuracy: t('games.chess_v1.analysis.quality.inaccuracy'),
      mistake: t('games.chess_v1.analysis.quality.mistake'),
      blunder: t('games.chess_v1.analysis.quality.blunder'),
      brilliant: t('games.chess_v1.analysis.quality.good'),
      great: t('games.chess_v1.analysis.quality.good'),
    }),
    [t],
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
        <h2 className="text-[16px] font-bold text-[var(--color)]">
          {t('games.chess_v1.analysis.title')}
          {loading && <span className="ml-2 text-[10px] text-[var(--textSecondary)]">(Stockfish 19...)</span>}
        </h2>
        <div className="flex items-center gap-2">
          {isSpectator && (
            <button
              type="button"
              onClick={() => setSpectatorPerspective((p) => (p === 'white' ? 'black' : 'white'))}
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
            {turningPoint.notation || `${Math.floor(turningPoint.ply / 2) + 1}.`}
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
