'use client';

import { useMemo, useState } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import type { AnalyzedMove, MoveQuality } from '../lib/analyzeGame';

interface MoveTimelineProps {
  moves: AnalyzedMove[];
  qualityLabels: Record<MoveQuality, string>;
  unitLabel: string;
}

const QUALITY_CLASSES: Record<MoveQuality, string> = {
  good: 'text-[#22c55e]',
  inaccuracy: 'text-[#f59e0b]',
  mistake: 'text-[#f97316]',
  blunder: 'text-[#ef4444]',
  brilliant: 'text-[#22c55e]',
  great: 'text-[#10b981]',
};

interface MovePair {
  number: number;
  white: AnalyzedMove | null;
  black: AnalyzedMove | null;
}

function formatMoverDelta(move: AnalyzedMove, unitLabel: string): string {
  const moverDelta = move.color === 'white' ? move.delta : -move.delta;
  const signed = moverDelta > 0 ? `+${moverDelta}` : `${moverDelta}`;
  return `${signed}${unitLabel}`;
}

function MoveCell({
  move,
  qualityLabels,
  unitLabel,
  isHovered,
  onHover,
}: {
  move: AnalyzedMove;
  qualityLabels: Record<MoveQuality, string>;
  unitLabel: string;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={cx(
        'flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-1 rounded-md px-2 py-1 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(99,102,241,0.6)]',
        isHovered
          ? 'bg-[rgba(99,102,241,0.15)]'
          : 'hover:bg-[rgba(255,255,255,0.05)]',
      )}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
    >
      <span className="truncate text-[13px] font-medium text-[rgba(248,250,252,0.85)]">
        {move.notation || '—'}
      </span>
      <span
        className={cx(
          'shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
          QUALITY_CLASSES[move.quality],
        )}
      >
        {qualityLabels[move.quality]}
      </span>
      <span
        className={cx(
          'shrink-0 text-[11px] font-semibold tabular-nums',
          move.loss === 0
            ? 'text-[rgba(148,163,184,0.6)]'
            : QUALITY_CLASSES[move.quality],
        )}
      >
        {formatMoverDelta(move, unitLabel)}
      </span>
    </button>
  );
}

export function MoveTimeline({
  moves,
  qualityLabels,
  unitLabel,
}: MoveTimelineProps) {
  const [hoveredPly, setHoveredPly] = useState<number | null>(null);

  const pairs = useMemo<MovePair[]>(() => {
    const result: MovePair[] = [];
    for (let i = 0; i < moves.length; i += 2) {
      result.push({
        number: Math.floor(i / 2) + 1,
        white: moves[i] ?? null,
        black: moves[i + 1] ?? null,
      });
    }
    return result;
  }, [moves]);

  if (moves.length === 0) return null;

  return (
    <div className="max-h-[220px] overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(15,20,30,0.5)] p-2">
      {pairs.map((pair) => {
        const { white, black } = pair;
        return (
          <div
            key={pair.number}
            className="flex items-center gap-1 border-b border-[rgba(255,255,255,0.04)] py-0.5 last:border-b-0"
          >
            <span className="w-8 shrink-0 text-right text-[12px] text-[rgba(148,163,184,0.5)]">
              {pair.number}.
            </span>
            {white && (
              <MoveCell
                move={white}
                qualityLabels={qualityLabels}
                unitLabel={unitLabel}
                isHovered={hoveredPly === white.ply}
                onHover={(hovered) => setHoveredPly(hovered ? white.ply : null)}
              />
            )}
            {black && (
              <MoveCell
                move={black}
                qualityLabels={qualityLabels}
                unitLabel={unitLabel}
                isHovered={hoveredPly === black.ply}
                onHover={(hovered) => setHoveredPly(hovered ? black.ply : null)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
