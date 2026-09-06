'use client';

import { memo, useMemo } from 'react';
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
  myColor?: 'white' | 'black' | null;
  isSpectator?: boolean;
  spectatorPerspective?: 'white' | 'black';
  onTogglePerspective?: () => void;
}

/**
 * Displays live Stockfish 19 engine evaluation during a chess game.
 *
 * Shows centipawn/mate score, search depth, principal variation line,
 * and analysis status. Engine: Stockfish 19 (latest stable, released
 * 2026-09-05, SFNNv16 architecture).
 */
function LiveEvalDisplayImpl({ eval_, analyzing, myColor, isSpectator, spectatorPerspective, onTogglePerspective }: LiveEvalDisplayProps) {
  // Players: their own color. Spectators: toggle between White/Black.
  const perspective = isSpectator ? (spectatorPerspective ?? 'white') : (myColor ?? 'white');
  const shouldFlip = perspective === 'black';

  // Flip eval for the selected perspective
  const displayEval = useMemo(() => {
    if (!eval_) return null;
    return {
      ...eval_,
      cp: eval_.cp != null ? (shouldFlip ? -eval_.cp : eval_.cp) : null,
      mate: eval_.mate != null ? (shouldFlip ? -eval_.mate : eval_.mate) : null,
    };
  }, [eval_, shouldFlip]);

  if (!displayEval && !analyzing) return null;

  const formatEval = (e: EngineEval): string => {
    if (e.mate != null && e.mate !== 0) {
      return `M${Math.abs(e.mate)}`;
    }
    if (e.cp != null) {
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
        <div className="flex items-center gap-2">
          {analyzing && (
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[9px] text-amber-400 font-medium">
                Analyzing
              </span>
            </div>
          )}
          {isSpectator && onTogglePerspective && (
            <button
              type="button"
              onClick={onTogglePerspective}
              className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:text-[var(--color)] cursor-pointer transition-colors"
            >
              {perspective === 'white' ? '♔ White' : '♚ Black'}
            </button>
          )}
        </div>
      </div>

      {displayEval && (
        <>
          <div className="flex items-baseline gap-2">
            <span
              className={cx(
                'text-2xl font-bold tabular-nums',
                evalColor(displayEval),
              )}
            >
              {formatEval(displayEval)}
            </span>
            <span className="text-[10px] text-[var(--textSecondary)]">
              depth {displayEval.depth}/{displayEval.selDepth}
            </span>
          </div>

          {displayEval.pv.length > 0 && (
            <div className="text-[11px] text-[var(--textSecondary)] font-mono truncate">
              {displayEval.pv.slice(0, 6).join(' ')}
              {displayEval.pv.length > 6 && ' ...'}
            </div>
          )}

          <div className="flex gap-3 text-[9px] text-[var(--textSecondary)]">
            <span>{formatNodes(displayEval.nodes)} nodes</span>
            <span>{formatNps(displayEval.nps)}</span>
            <span>{(displayEval.timeMs / 1000).toFixed(1)}s</span>
          </div>
        </>
      )}
    </div>
  );
}

export const LiveEvalDisplay = memo(LiveEvalDisplayImpl);
