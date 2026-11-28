'use client';

import { memo } from 'react';
import type { TranslationKey } from '@/shared/i18n/useTranslation';
import type { HistoryStep } from '../hooks/useMoveHistoryView';

interface MoveListNavProps {
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  onStep: (step: HistoryStep) => void;
  atStart: boolean;
  atEnd: boolean;
}

const STEPS: { step: HistoryStep; key: TranslationKey; glyph: string }[] = [
  { step: 'first', key: 'games.chess_v1.moveList.first', glyph: '⏮' },
  { step: 'prev', key: 'games.chess_v1.moveList.prev', glyph: '◀' },
  { step: 'next', key: 'games.chess_v1.moveList.next', glyph: '▶' },
  { step: 'last', key: 'games.chess_v1.moveList.last', glyph: '⏭' },
];

/** First / previous / next / latest controls for the move history. */
function MoveListNavImpl({ t, onStep, atStart, atEnd }: MoveListNavProps) {
  return (
    <div className="flex flex-col gap-1 shrink-0">
      <div
        role="group"
        aria-label={t('games.chess_v1.moveList.title')}
        className="grid grid-cols-4 gap-1.5 p-1 bg-black/20 rounded-xl border border-white/5"
      >
        {STEPS.map(({ step, key, glyph }) => {
          const disabled =
            step === 'first' || step === 'prev' ? atStart : atEnd;
          return (
            <button
              key={step}
              type="button"
              title={t(key)}
              aria-label={t(key)}
              disabled={disabled}
              onClick={() => onStep(step)}
              className="min-h-9 text-sm rounded-lg bg-white/5 hover:bg-white/15 text-[var(--textSecondary)] hover:text-[var(--color)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default disabled:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
            >
              <span aria-hidden="true">{glyph}</span>
            </button>
          );
        })}
      </div>
      <p className="hidden sm:block text-[10px] text-[var(--textSecondary)] px-1">
        {t('games.chess_v1.moveList.navHint')}
      </p>
    </div>
  );
}

export const MoveListNav = memo(MoveListNavImpl);
