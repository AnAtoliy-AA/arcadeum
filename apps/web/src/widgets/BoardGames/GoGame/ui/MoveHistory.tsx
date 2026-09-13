'use client';

import { memo, useEffect, useRef } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/i18n/useTranslation';

const COLUMN_LABELS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';

export interface KifuMove {
  moveNumber: number;
  color: 'black' | 'white';
  row: number;
  col: number;
  captureCount?: number;
  isPass: boolean;
}

interface MoveHistoryProps {
  moves: KifuMove[];
  currentMoveIndex: number;
  disabled?: boolean;
  onMoveSelect: (index: number) => void;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
}

function formatMoveLabel(move: KifuMove): string {
  if (move.isPass) return 'Pass';
  const col = COLUMN_LABELS[move.col] ?? '?';
  const row = 19 - move.row;
  return `${col}${row}`;
}

const MoveHistory = memo(function MoveHistory({
  moves,
  currentMoveIndex,
  disabled = false,
  onMoveSelect,
  onFirst,
  onPrev,
  onNext,
  onLast,
}: MoveHistoryProps) {
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current;
      const selected = el.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [currentMoveIndex]);

  return (
    <div className="flex flex-col rounded-xl border border-[var(--borderColor)] bg-[var(--background)] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--borderColor)] px-3 py-2">
        <span className="text-xs font-semibold opacity-70 uppercase tracking-wide">
          {t('games.go_v1.kifu.title')}
        </span>
        <span className="text-xs opacity-50">
          {moves.length} {t('games.go_v1.kifu.moves')}
        </span>
      </div>

      <div
        ref={listRef}
        className="max-h-[200px] overflow-y-auto overscroll-contain"
        role="listbox"
        aria-label={t('games.go_v1.kifu.ariaLabel')}
      >
        {moves.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs opacity-40">
            {t('games.go_v1.kifu.empty')}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-px bg-[var(--borderColor)]">
            {moves.map((move, idx) => {
              const isSelected = idx === currentMoveIndex;
              return (
                <button
                  key={`${move.moveNumber}-${move.color}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  data-selected={isSelected}
                  disabled={disabled}
                  onClick={() => onMoveSelect(idx)}
                  className={cx(
                    'flex items-center gap-1.5 px-2.5 py-1.5 text-left text-xs transition-colors',
                    isSelected
                      ? 'bg-[var(--primary)]/20 font-semibold'
                      : 'bg-[var(--background)] hover:bg-[var(--backgroundHover)]',
                    disabled && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  <span className="flex items-center justify-center w-5">
                    {move.color === 'black' ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-black border border-black/30" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300" />
                    )}
                  </span>
                  <span className="opacity-50 w-5 text-right">
                    {move.moveNumber}.
                  </span>
                  <span className="font-mono">{formatMoveLabel(move)}</span>
                  {move.captureCount && move.captureCount > 0 ? (
                    <span className="text-[10px] text-amber-500 font-semibold">
                      +{move.captureCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[var(--borderColor)] px-2 py-1.5">
        <button
          type="button"
          disabled={disabled || moves.length === 0}
          onClick={onFirst}
          className="p-1 rounded hover:bg-[var(--backgroundHover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={t('games.go_v1.kifu.first')}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 2h2v12H3V2zm4 6l7-6v12L7 8z" />
          </svg>
        </button>
        <button
          type="button"
          disabled={disabled || currentMoveIndex <= 0}
          onClick={onPrev}
          className="p-1 rounded hover:bg-[var(--backgroundHover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={t('games.go_v1.kifu.prev')}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10 8L3 2v12l7-6z" />
          </svg>
        </button>
        <span className="text-[10px] opacity-50 font-mono">
          {moves.length > 0 ? `${currentMoveIndex + 1}/${moves.length}` : '0/0'}
        </span>
        <button
          type="button"
          disabled={disabled || currentMoveIndex >= moves.length - 1}
          onClick={onNext}
          className="p-1 rounded hover:bg-[var(--backgroundHover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={t('games.go_v1.kifu.next')}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 8l7-6v12L6 8z" />
          </svg>
        </button>
        <button
          type="button"
          disabled={disabled || currentMoveIndex >= moves.length - 1}
          onClick={onLast}
          className="p-1 rounded hover:bg-[var(--backgroundHover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={t('games.go_v1.kifu.last')}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11 2h2v12h-2V2zM2 2l7 6-7 6V2z" />
          </svg>
        </button>
      </div>
    </div>
  );
});

export default MoveHistory;
