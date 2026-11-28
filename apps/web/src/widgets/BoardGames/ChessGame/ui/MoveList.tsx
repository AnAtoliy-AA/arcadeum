'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { ChessClientState } from '../types';
import type { MoveQuality } from '@/features/analysis/lib/analyzeGame';
import type { TranslationKey } from '@/shared/i18n/useTranslation';
import type { HistoryStep } from '../hooks/useMoveHistoryView';
import { generateFEN, generateMoveList, generatePGN } from '../lib/pgn';
import { MoveListNav } from './MoveListNav';

const QUALITY_BADGE: Record<MoveQuality, { symbol: string; color: string }> = {
  brilliant: { symbol: '!!', color: 'text-cyan-400' },
  great: { symbol: '!', color: 'text-green-600' },
  best: { symbol: '✓', color: 'text-emerald-400' },
  excellent: { symbol: '✓', color: 'text-emerald-400' },
  good: { symbol: '✓', color: 'text-emerald-400' },
  book: { symbol: '', color: 'text-gray-400' },
  inaccuracy: { symbol: '?!', color: 'text-yellow-400' },
  mistake: { symbol: '?', color: 'text-orange-400' },
  blunder: { symbol: '??', color: 'text-red-400' },
};

type CopyState = 'idle' | 'pgn' | 'fen' | 'failed';

interface MoveListProps {
  state: ChessClientState;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  onMoveHover?: (moveIndex: number | null) => void;
  onSelectMove?: (moveIndex: number) => void;
  onStep?: (step: HistoryStep) => void;
  /** Move being viewed: -1 is the start position, null means live. */
  selectedMoveIndex?: number | null;
  openingName?: string | null;
  moveQualities?: MoveQuality[];
}

export function MoveList({
  state,
  t,
  onMoveHover,
  onSelectMove,
  onStep,
  selectedMoveIndex = null,
  openingName,
  moveQualities,
}: MoveListProps) {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const activeRowRef = useRef<HTMLLIElement>(null);
  const scrollContainerRef = useRef<HTMLOListElement>(null);
  const copyTimerRef = useRef<number | null>(null);

  const moves = useMemo(() => generateMoveList(state), [state]);
  const totalMoves = moves.length;
  // With no explicit selection the latest move is the "current" one.
  const currentIndex = selectedMoveIndex ?? totalMoves - 1;

  const pairs = useMemo(() => {
    const result: { num: number; whiteIdx: number; blackIdx: number }[] = [];
    for (let i = 0; i < moves.length; i += 2) {
      result.push({ num: i / 2 + 1, whiteIdx: i, blackIdx: i + 1 });
    }
    return result;
  }, [moves]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const row = activeRowRef.current;
    if (!container) return;
    if (row && selectedMoveIndex !== null) {
      // Scroll inside the list only; never move the page.
      const top = row.offsetTop - container.offsetTop;
      if (top < container.scrollTop) container.scrollTop = top;
      else if (
        top + row.offsetHeight >
        container.scrollTop + container.clientHeight
      )
        container.scrollTop = top + row.offsetHeight - container.clientHeight;
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, [selectedMoveIndex, totalMoves]);

  useEffect(
    () => () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    },
    [],
  );

  const copy = useCallback(
    (kind: 'pgn' | 'fen') => {
      const text = kind === 'pgn' ? generatePGN(state) : generateFEN(state);
      const done = (next: CopyState) => {
        setCopyState(next);
        if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
        copyTimerRef.current = window.setTimeout(
          () => setCopyState('idle'),
          2000,
        );
      };
      if (!navigator.clipboard) {
        done('failed');
        return;
      }
      navigator.clipboard.writeText(text).then(
        () => done(kind),
        () => done('failed'),
      );
    },
    [state],
  );

  const handleStep = useCallback(
    (target: HistoryStep) => {
      if (totalMoves === 0) return;
      if (onStep) {
        onStep(target);
        return;
      }
      const next =
        target === 'first'
          ? 0
          : target === 'prev'
            ? Math.max(0, currentIndex - 1)
            : target === 'next'
              ? Math.min(totalMoves - 1, currentIndex + 1)
              : totalMoves - 1;
      onSelectMove?.(next);
    },
    [totalMoves, onStep, onSelectMove, currentIndex],
  );

  const colorName = (idx: number) =>
    idx % 2 === 0
      ? t('games.chess_v1.status.white')
      : t('games.chess_v1.status.black');

  const renderMove = (idx: number) => {
    const san = moves[idx];
    if (!san) return <span className="flex-1" aria-hidden="true" />;
    const isCurrent = idx === currentIndex;
    const quality = moveQualities?.[idx];
    const badge = quality ? QUALITY_BADGE[quality] : null;
    return (
      <button
        type="button"
        aria-current={isCurrent ? 'step' : undefined}
        aria-label={t('games.chess_v1.moveList.moveLabel', {
          number: Math.floor(idx / 2) + 1,
          color: colorName(idx),
          san,
        })}
        data-testid={`chess-move-${idx}`}
        className={`flex-1 min-h-7 text-left px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-0.5 focus-visible:outline-2 focus-visible:outline-[var(--primary)] ${
          isCurrent
            ? 'bg-amber-500/25 text-amber-300 font-bold shadow-sm'
            : idx % 2 === 0
              ? 'text-[var(--color)] hover:bg-white/10'
              : 'text-[var(--textSecondary)] hover:text-[var(--color)] hover:bg-white/10'
        }`}
        onMouseEnter={() => onMoveHover?.(idx)}
        onMouseLeave={() => onMoveHover?.(null)}
        onFocus={() => onMoveHover?.(idx)}
        onBlur={() => onMoveHover?.(null)}
        onClick={() => onSelectMove?.(idx)}
      >
        <span>{san}</span>
        {badge?.symbol && (
          <span
            aria-hidden="true"
            className={`text-[9px] font-black leading-none ${badge.color}`}
          >
            {badge.symbol}
          </span>
        )}
      </button>
    );
  };

  const copyLabel = (kind: 'pgn' | 'fen') =>
    copyState === kind
      ? t('games.chess_v1.moveList.copied')
      : t(
          kind === 'pgn'
            ? 'games.chess_v1.moveList.copyPgn'
            : 'games.chess_v1.moveList.copyFen',
        );

  return (
    <section
      className="flex flex-col gap-1.5 shrink-0"
      aria-labelledby="chess-move-list-title"
    >
      <div className="flex justify-between items-start gap-2 px-1 shrink-0">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3
              id="chess-move-list-title"
              className="text-[11px] text-[var(--textSecondary)] font-bold uppercase tracking-wider"
            >
              {t('games.chess_v1.moveList.title')}
            </h3>
            <span className="text-[10px] px-1.5 rounded bg-white/5 text-[var(--textSecondary)] font-mono">
              {totalMoves}
            </span>
          </div>
          {openingName && (
            <span
              className="text-[10px] font-semibold text-[var(--textSecondary)] bg-white/5 px-1.5 py-0.5 rounded-full border border-white/10 truncate max-w-[180px]"
              title={openingName}
            >
              {t('games.chess_v1.moveList.opening', { name: openingName })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(['pgn', 'fen'] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => copy(kind)}
              className={`min-h-6 text-[11px] bg-transparent border-0 cursor-pointer p-0 transition-colors font-medium ${
                copyState === kind
                  ? 'text-emerald-400 font-semibold'
                  : 'text-[var(--textSecondary)] hover:text-[var(--color)]'
              }`}
            >
              {copyLabel(kind)}
            </button>
          ))}
        </div>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {copyState === 'pgn' || copyState === 'fen'
          ? t('games.chess_v1.moveList.copied')
          : copyState === 'failed'
            ? t('games.chess_v1.moveList.copyFailed')
            : ''}
      </span>

      <ol
        ref={scrollContainerRef}
        aria-labelledby="chess-move-list-title"
        className="h-[140px] max-h-[180px] overflow-y-auto modern-scrollbar p-1.5 rounded-xl bg-black/25 border border-white/5 font-mono select-none list-none m-0"
      >
        {pairs.length === 0 && (
          <li className="text-xs text-[var(--textSecondary)] text-center py-6">
            {t('games.chess_v1.moveList.empty')}
          </li>
        )}
        {pairs.map((pair) => {
          const isActivePair =
            currentIndex === pair.whiteIdx || currentIndex === pair.blackIdx;
          return (
            <li
              key={pair.num}
              ref={isActivePair ? activeRowRef : undefined}
              className={`flex items-center py-0.5 px-1 rounded transition-colors text-xs ${
                isActivePair ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <span
                aria-hidden="true"
                className="w-7 text-[11px] text-[var(--textSecondary)] text-right pr-2 select-none"
              >
                {pair.num}.
              </span>
              {renderMove(pair.whiteIdx)}
              {renderMove(pair.blackIdx)}
            </li>
          );
        })}
      </ol>

      {totalMoves > 0 && (
        <MoveListNav
          t={t}
          onStep={handleStep}
          atStart={
            selectedMoveIndex !== null && selectedMoveIndex <= (onStep ? -1 : 0)
          }
          atEnd={selectedMoveIndex === null || currentIndex >= totalMoves - 1}
        />
      )}
    </section>
  );
}
