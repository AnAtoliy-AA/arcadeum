'use client';

import { memo } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/i18n/useTranslation';
import {
  BOARD_CELL_FOCUS_CLASS,
  isActivationKey,
} from '@/shared/lib/keyboard-navigation';

interface BackgammonBearOffProps {
  p0BorneOff: number;
  p1BorneOff: number;
  canBearOff: boolean;
  onBearOffClick: () => void;
  canMove: boolean;
}

export const BackgammonBearOff = memo(function BackgammonBearOff({
  p0BorneOff,
  p1BorneOff,
  canBearOff,
  onBearOffClick,
  canMove,
}: BackgammonBearOffProps) {
  const { t } = useTranslation();

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (!isActivationKey(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    onBearOffClick();
  };

  return (
    <div
      className={cx(
        'backgammon-bear-off-area w-11 sm:w-16 h-full ml-1.5 border-l flex flex-col justify-between p-1.5 rounded-r-xl transition-all duration-200 cursor-pointer select-none relative',
        BOARD_CELL_FOCUS_CLASS,
        canBearOff &&
          'ring-2 ring-emerald-400/90 shadow-[0_0_16px_rgba(52,211,153,0.45)] bg-emerald-950/30',
        !canMove && 'pointer-events-none',
      )}
      data-testid="bear-off-zone"
      role="button"
      tabIndex={0}
      aria-label={t('games.backgammon_v1.game.bearOffZone')}
      onClick={onBearOffClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white/50">
          OFF
        </span>
        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg border-2 flex items-center justify-center text-[10px] sm:text-xs font-black shadow-md backgammon-checker-p0">
          {p0BorneOff}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center my-auto">
        {canBearOff ? (
          <div className="animate-pulse flex flex-col items-center gap-0.5">
            <span className="text-[8px] sm:text-[9px] font-black text-emerald-300 bg-emerald-900/90 px-1.5 py-0.5 rounded border border-emerald-400/60 uppercase tracking-tighter text-center shadow-md">
              BEAR OFF
            </span>
            <span className="text-xs text-emerald-400">⬇</span>
          </div>
        ) : (
          <div className="w-1 h-8 rounded-full bg-white/10" />
        )}
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg border-2 flex items-center justify-center text-[10px] sm:text-xs font-black shadow-md backgammon-checker-p1">
          {p1BorneOff}
        </div>
      </div>
    </div>
  );
});
