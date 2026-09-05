'use client';

import { memo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

interface EngineEval {
  cp: number | null;
  mate: number | null;
  pv: string[];
  depth: number;
  selDepth: number;
  nodes: number;
  nps: number;
  timeMs: number;
}

interface LiveEvalDisplayProps {
  eval_: EngineEval | null;
  analyzing: boolean;
}

/**
 * Displays live Stockfish 19 engine evaluation during a chess game.
 *
 * Shows centipawn/mate score, search depth, principal variation line,
 * and analysis status. Engine: Stockfish 19 (latest stable, released
 * 2026-09-05, SFNNv16 architecture).
 */
function LiveEvalDisplayImpl({ eval_, analyzing }: LiveEvalDisplayProps) {
  if (!eval_ && !analyzing) return null;

  const formatEval = (e: EngineEval): string => {
    if (e.mate !== null) {
      return `M${Math.abs(e.mate)}`;
    }
    if (e.cp !== null) {
      const pawns = (e.cp / 100).toFixed(1);
      return e.cp > 0 ? `+${pawns}` : pawns;
    }
    return '0.0';
  };

  const evalColor = (e: EngineEval): string => {
    if (e.mate !== null) {
      return e.mate > 0 ? 'text-emerald-400' : 'text-red-400';
    }
    if (e.cp !== null) {
      if (e.cp > 50) return 'text-emerald-400';
      if (e.cp < -50) return 'text-red-400';
    }
    return 'text-[var(--textSecondary)]';
  };

  const formatNodes = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  const formatNps = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}MN/s`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}KN/s`;
    return `${n}N/s`;
  };

  return (
    <div className="p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold text-[var(--textSecondary)] uppercase tracking-wider">
          STOCKFISH 19
        </div>
        {analyzing && (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[9px] text-amber-400 font-medium">
              Analyzing
            </span>
          </div>
        )}
      </div>

      {eval_ && (
        <>
          <div className="flex items-baseline gap-2">
            <span
              className={cx(
                'text-2xl font-bold tabular-nums',
                evalColor(eval_),
              )}
            >
              {formatEval(eval_)}
            </span>
            <span className="text-[10px] text-[var(--textSecondary)]">
              depth {eval_.depth}/{eval_.selDepth}
            </span>
          </div>

          {eval_.pv.length > 0 && (
            <div className="text-[11px] text-[var(--textSecondary)] font-mono truncate">
              {eval_.pv.slice(0, 6).join(' ')}
              {eval_.pv.length > 6 && ' ...'}
            </div>
          )}

          <div className="flex gap-3 text-[9px] text-[var(--textSecondary)]">
            <span>{formatNodes(eval_.nodes)} nodes</span>
            <span>{formatNps(eval_.nps)}</span>
            <span>{(eval_.timeMs / 1000).toFixed(1)}s</span>
          </div>
        </>
      )}
    </div>
  );
}

export const LiveEvalDisplay = memo(LiveEvalDisplayImpl);
