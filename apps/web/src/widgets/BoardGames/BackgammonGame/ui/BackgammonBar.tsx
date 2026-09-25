'use client';

import { memo } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/i18n/useTranslation';
import {
  BOARD_CELL_FOCUS_CLASS,
  isActivationKey,
} from '@/shared/lib/keyboard-navigation';

interface BackgammonBarProps {
  p0Bar: number;
  p1Bar: number;
  myBar: number;
  selectedFrom: number | 'bar' | null;
  onBarClick: () => void;
  canMove: boolean;
}

export const BackgammonBar = memo(function BackgammonBar({
  p0Bar,
  p1Bar,
  myBar,
  selectedFrom,
  onBarClick,
  canMove,
}: BackgammonBarProps) {
  const { t } = useTranslation();

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (!isActivationKey(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    onBarClick();
  };

  const isBarSelected = selectedFrom === 'bar';
  const hasMyCheckers = myBar > 0;

  return (
    <div
      className={cx(
        'backgammon-bar-area w-7 sm:w-10 h-full mx-1 rounded-lg flex flex-col items-center justify-between py-1.5 cursor-pointer transition-all duration-200 border select-none relative',
        BOARD_CELL_FOCUS_CLASS,
        hasMyCheckers &&
          !isBarSelected &&
          'ring-2 ring-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.35)]',
        isBarSelected &&
          'ring-2 ring-purple-400 shadow-[0_0_14px_rgba(192,132,252,0.5)]',
        !canMove && 'pointer-events-none',
      )}
      data-testid="bar-zone"
      role="button"
      tabIndex={0}
      aria-label={t('games.backgammon_v1.game.barZone')}
      onClick={onBarClick}
      onKeyDown={handleKeyDown}
    >
      <div className="w-3.5 sm:w-5 h-0.5 rounded-full bg-white/20 mb-0.5 pointer-events-none" />

      <div className="flex flex-col items-center gap-1">
        <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider text-white/40">
          BAR
        </span>
        {p0Bar > 0 && (
          <div
            className={cx(
              'w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center text-[10px] font-black shadow-md ring-1 ring-white/40 backgammon-checker-p0 transition-transform',
              isBarSelected && 'scale-110',
            )}
          >
            {p0Bar}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-1 my-auto">
        <div className="w-4 sm:w-6 h-1.5 rounded-sm bg-amber-600/40 border border-amber-500/50 shadow-xs" />
        {hasMyCheckers && (
          <span className="animate-bounce text-[7px] sm:text-[8px] font-black text-amber-300 uppercase tracking-tight text-center px-1 py-0.5 bg-amber-950/80 rounded border border-amber-400/50">
            ENTER
          </span>
        )}
        <div className="w-4 sm:w-6 h-1.5 rounded-sm bg-amber-600/40 border border-amber-500/50 shadow-xs" />
      </div>

      <div className="flex flex-col items-center gap-1">
        {p1Bar > 0 && (
          <div
            className={cx(
              'w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center text-[10px] font-black shadow-md ring-1 ring-white/40 backgammon-checker-p1 transition-transform',
              isBarSelected && 'scale-110',
            )}
          >
            {p1Bar}
          </div>
        )}
        <div className="w-3.5 sm:w-5 h-0.5 rounded-full bg-white/20 mt-0.5 pointer-events-none" />
      </div>
    </div>
  );
});
