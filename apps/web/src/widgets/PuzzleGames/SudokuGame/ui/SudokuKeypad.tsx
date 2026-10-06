'use client';

import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useSoloFullscreen } from '@/features/games/ui/SoloGameContainer';

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

interface SudokuKeypadProps {
  selected: number | null;
  notesMode: boolean;
  digitCounts: Record<number, number>;
  highlightErrors: boolean;
  onApplyDigit: (digit: number) => void;
  onToggleNotes: () => void;
  onErase: () => void;
  onAutoNotes: () => void;
  onRequestHint: () => void;
  onToggleHighlightErrors: () => void;
}

export function SudokuKeypad({
  selected,
  notesMode,
  digitCounts,
  highlightErrors,
  onApplyDigit,
  onToggleNotes,
  onErase,
  onAutoNotes,
  onRequestHint,
  onToggleHighlightErrors,
}: SudokuKeypadProps) {
  const { t } = useTranslation();
  const isFullscreen = useSoloFullscreen();

  return (
    <div
      className={cx(
        'flex w-full flex-col items-center gap-2 rounded-2xl sm:rounded-3xl border-2 border-[var(--sdk-board-border)] bg-[var(--sdk-board-bg)] p-2 sm:p-2.5 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 select-none transition-all duration-200 mt-1',
        isFullscreen
          ? 'max-w-[min(94vw,min(calc(100dvh-14rem),40rem))]'
          : 'max-w-[min(100vw-1rem,min(48vh,24.5rem))] sm:max-w-[min(100vw-2rem,min(50vh,25.5rem))]',
      )}
    >
      <div className="grid w-full grid-cols-9 gap-1 sm:gap-1.5">
        {DIGITS.map((digit) => {
          const count = digitCounts[digit] ?? 0;
          const remaining = Math.max(9 - count, 0);
          const isCompleted = remaining === 0;

          return (
            <button
              key={digit}
              type="button"
              onClick={() => onApplyDigit(digit)}
              disabled={selected === null || isCompleted}
              aria-label={
                notesMode
                  ? t('games.sudoku_v1.controls.noteDigit', { digit })
                  : t('games.sudoku_v1.controls.placeDigit', { digit })
              }
              data-testid={`sudoku-digit-${digit}`}
              className={cx(
                'flex flex-col items-center justify-center rounded-xl border py-1.5 sm:py-2 font-mono transition-all shadow-sm select-none',
                isCompleted
                  ? 'border-dashed border-white/10 bg-black/20 opacity-25 cursor-not-allowed'
                  : notesMode
                    ? 'border-[var(--primary)] bg-[var(--primary)]/25 text-[var(--color)] shadow-inner hover:bg-[var(--primary)]/35 active:scale-95 ring-1 ring-[var(--primary)]/50'
                    : 'border-white/15 bg-white/10 text-[var(--color)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/20 active:scale-95 hover:shadow-md',
                'disabled:opacity-60 disabled:cursor-not-allowed',
              )}
            >
              <span
                className={cx(
                  'text-sm font-extrabold sm:text-base drop-shadow-xs',
                  isFullscreen && 'md:text-lg',
                )}
              >
                {digit}
              </span>
              <span className="text-[9px] sm:text-[10px] text-[var(--textSecondary)] font-semibold">
                {remaining}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 select-none">
        <button
          type="button"
          onClick={onToggleNotes}
          aria-pressed={notesMode}
          title={t('games.sudoku_v1.controls.notesHint')}
          data-testid="sudoku-toggle-notes-button"
          className={cx(
            'flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 sm:py-2 text-xs font-bold transition-all shadow-sm',
            notesMode
              ? 'border-[var(--primary)] bg-[var(--primary)]/30 text-[var(--color)] shadow-md shadow-[var(--primary)]/20 ring-1 ring-[var(--primary)]'
              : 'border-white/15 bg-white/10 text-[var(--color)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/20 active:scale-95',
          )}
        >
          <span>✎</span>
          <span className="truncate">
            {t('games.sudoku_v1.controls.notes')}
          </span>
        </button>

        <button
          type="button"
          onClick={onErase}
          disabled={selected === null}
          title={t('games.sudoku_v1.controls.erase')}
          data-testid="sudoku-erase-button"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-2.5 py-1.5 sm:py-2 text-xs font-bold text-[var(--color)] shadow-sm transition-all hover:border-rose-500/60 hover:bg-rose-500/20 hover:text-rose-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>⌫</span>
          <span className="truncate">
            {t('games.sudoku_v1.controls.erase')}
          </span>
        </button>

        <button
          type="button"
          onClick={onAutoNotes}
          title={t('games.sudoku_v1.controls.autoNotesHint')}
          data-testid="sudoku-auto-notes-button"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-2.5 py-1.5 sm:py-2 text-xs font-bold text-[var(--color)] shadow-sm transition-all hover:border-cyan-500/60 hover:bg-cyan-500/20 active:scale-95"
        >
          <span>✨</span>
          <span className="truncate">
            {t('games.sudoku_v1.controls.autoNotes')}
          </span>
        </button>

        <button
          type="button"
          onClick={onRequestHint}
          title={t('games.sudoku_v1.controls.hintHint')}
          data-testid="sudoku-hint-button"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/15 px-2.5 py-1.5 sm:py-2 text-xs font-bold text-amber-200 shadow-sm transition-all hover:border-amber-400/80 hover:bg-amber-400/25 active:scale-95"
        >
          <span>💡</span>
          <span className="truncate">{t('games.sudoku_v1.controls.hint')}</span>
        </button>

        <button
          type="button"
          onClick={onToggleHighlightErrors}
          aria-pressed={highlightErrors}
          data-testid="sudoku-toggle-errors-button"
          className={cx(
            'col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 sm:py-2 text-xs font-bold transition-all shadow-sm',
            highlightErrors
              ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
              : 'border-white/15 bg-white/10 text-white/50 hover:bg-white/15',
          )}
        >
          <span>⚡</span>
          <span className="truncate">
            {t('games.sudoku_v1.controls.highlightErrors')}
          </span>
        </button>
      </div>
    </div>
  );
}
