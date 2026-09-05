'use client';

import { useMemo } from 'react';
import { EvalBarContainer } from './styles';

interface EvalBarProps {
  /** White-perspective evaluation in centipawns. null = unknown. */
  evalScore: number | null;
  /** Mate score. null = not a mate. */
  mateScore?: number | null;
}

/**
 * Visual evaluation bar showing engine advantage.
 * Driven by Stockfish 19 analysis (latest stable, released 2026-09-05).
 */
export function EvalBar({ evalScore, mateScore }: EvalBarProps) {
  const advantage = useMemo(() => {
    if (mateScore != null) {
      return mateScore > 0 ? 85 : 15;
    }
    if (evalScore == null) return 50;
    const clamped = Math.max(-5, Math.min(5, evalScore));
    return 50 + (clamped / 5) * 40;
  }, [evalScore, mateScore]);

  const barColor =
    advantage > 55
      ? 'rgba(34, 197, 94, 0.8)'
      : advantage < 45
        ? 'rgba(239, 68, 68, 0.8)'
        : 'rgba(148, 163, 184, 0.4)';

  const evalLabel = useMemo(() => {
    if (mateScore != null) return `M${Math.abs(mateScore)}`;
    if (evalScore == null) return '';
    const pawns = (evalScore / 100).toFixed(1);
    return evalScore > 0 ? `+${pawns}` : pawns;
  }, [evalScore, mateScore]);

  return (
    <EvalBarContainer>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${advantage}%`,
          background: barColor,
          transition: 'height 0.5s ease, background 0.5s ease',
          borderRadius: '0 0 5px 5px',
        }}
      />
      <span className="absolute top-[4px] left-0 right-0 text-center text-[32px] font-bold text-[rgba(255,_255,_255,_0.5)]">
        ♔
      </span>
      {evalLabel && (
        <span className="absolute top-1/2 left-0 right-0 -translate-y-1/2 text-center text-[10px] font-bold text-white/70 tabular-nums">
          {evalLabel}
        </span>
      )}
      <span className="absolute bottom-[4px] left-0 right-0 text-center text-[32px] font-bold text-[rgba(255,_255,_255,_0.5)]">
        ♚
      </span>
    </EvalBarContainer>
  );
}
