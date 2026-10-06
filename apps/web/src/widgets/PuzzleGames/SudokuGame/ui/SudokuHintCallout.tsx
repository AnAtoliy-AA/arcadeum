'use client';

import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { TranslationKey } from '@/shared/i18n/useTranslation';
import type { SudokuHint } from '../types';

interface SudokuHintCalloutProps {
  hint: SudokuHint | null;
  onApply: () => void;
  onDismiss: () => void;
}

export function SudokuHintCallout({
  hint,
  onApply,
  onDismiss,
}: SudokuHintCalloutProps) {
  const { t } = useTranslation();

  if (!hint) return null;

  const explanationKey: TranslationKey =
    hint.type === 'naked_single'
      ? ('games.sudoku_v1.controls.hintNakedSingle' as TranslationKey)
      : hint.type === 'hidden_single'
        ? ('games.sudoku_v1.controls.hintHiddenSingle' as TranslationKey)
        : ('games.sudoku_v1.controls.hintDirect' as TranslationKey);

  return (
    <div
      data-testid="sudoku-hint-callout"
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-3 shadow-lg backdrop-blur-xl ring-1 ring-amber-400/30 text-amber-200 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-base">
          💡
        </span>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-semibold text-amber-100 truncate">
            {t(explanationKey, { digit: hint.digit })}
          </span>
          <span className="text-[10px] text-amber-300/80 font-mono">
            R{Math.floor(hint.index / 9) + 1}C{(hint.index % 9) + 1}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="sm"
          variant="primary"
          onClick={onApply}
          data-testid="sudoku-apply-hint-button"
          className="h-7 px-2.5 text-xs font-bold"
        >
          {t('games.sudoku_v1.controls.applyHint')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDismiss}
          data-testid="sudoku-dismiss-hint-button"
          className="h-7 px-2 text-xs text-amber-300 hover:text-white hover:bg-amber-400/20"
        >
          {t('games.sudoku_v1.controls.dismissHint')}
        </Button>
      </div>
    </div>
  );
}
