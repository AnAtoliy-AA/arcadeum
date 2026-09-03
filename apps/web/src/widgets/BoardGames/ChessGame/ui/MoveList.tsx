'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { ChessClientState } from '../types';
import { generateMoveList, generatePGN } from '../lib/pgn';

interface MoveListProps {
  state: ChessClientState;
  t: (
    key: import('@/shared/lib/useTranslation').TranslationKey,
    params?: Record<string, string | number>,
  ) => string;
  onMoveHover?: (moveIndex: number | null) => void;
}

export function MoveList({ state, t: _t, onMoveHover }: MoveListProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hoveredMove, setHoveredMove] = useState<number | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const pairs = useMemo(() => {
    const moves = generateMoveList(state);
    const result: {
      white: string;
      black: string;
      num: number;
      whiteIdx: number;
      blackIdx: number;
    }[] = [];
    for (let i = 0; i < moves.length; i += 2) {
      result.push({
        num: Math.floor(i / 2) + 1,
        white: moves[i] ?? '',
        black: moves[i + 1] ?? '',
        whiteIdx: i,
        blackIdx: i + 1,
      });
    }
    return result;
  }, [state]);

  const visiblePairs = expanded ? pairs : pairs.slice(-8);

  const handleCopyPGN = useCallback(() => {
    const pgn = generatePGN(state);
    navigator.clipboard.writeText(pgn).then(() => {
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }, [state]);

  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-[var(--textSecondary)] font-semibold uppercase tracking-wider">
          MOVES
        </span>
        <div className="flex gap-3">
          {pairs.length > 8 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-[11px] text-[var(--textSecondary)] hover:text-[var(--color)] bg-transparent border-0 cursor-pointer p-0 transition-colors"
            >
              {expanded ? 'Show less' : `Show all (${pairs.length})`}
            </button>
          )}
          <button
            type="button"
            onClick={handleCopyPGN}
            className={`text-[11px] bg-transparent border-0 cursor-pointer p-0 transition-colors ${
              copied
                ? 'text-emerald-500 font-semibold'
                : 'text-[var(--textSecondary)] hover:text-[var(--color)]'
            }`}
          >
            {copied ? 'Copied!' : 'Copy PGN'}
          </button>
        </div>
      </div>
      <div className="max-h-[240px] overflow-y-auto p-2.5 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] min-h-[60px]">
        {pairs.length === 0 && (
          <div className="text-xs text-[var(--textSecondary)] text-center py-4">
            No moves yet
          </div>
        )}
        {visiblePairs.map((pair) => (
          <div
            key={pair.num}
            className="flex items-center py-1 border-b border-[var(--glassBorder)] last:border-b-0"
          >
            <span className="w-8 text-xs text-[var(--textSecondary)] text-right pr-2">
              {pair.num}.
            </span>
            <span
              className={`flex-1 text-xs font-medium px-2 py-0.5 rounded cursor-pointer transition-colors ${
                hoveredMove === pair.whiteIdx
                  ? 'bg-sky-500/20 text-[var(--color)] font-bold'
                  : 'text-[var(--color)] hover:bg-[var(--backgroundHover)]'
              }`}
              onMouseEnter={() => {
                setHoveredMove(pair.whiteIdx);
                onMoveHover?.(pair.whiteIdx);
              }}
              onMouseLeave={() => {
                setHoveredMove(null);
                onMoveHover?.(null);
              }}
            >
              {pair.white}
            </span>
            <span
              className={`flex-1 text-xs font-medium px-2 py-0.5 rounded cursor-pointer transition-colors ${
                hoveredMove === pair.blackIdx
                  ? 'bg-sky-500/20 text-[var(--color)] font-bold'
                  : 'text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)] hover:text-[var(--color)]'
              }`}
              onMouseEnter={() => {
                setHoveredMove(pair.blackIdx);
                onMoveHover?.(pair.blackIdx);
              }}
              onMouseLeave={() => {
                setHoveredMove(null);
                onMoveHover?.(null);
              }}
            >
              {pair.black}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
