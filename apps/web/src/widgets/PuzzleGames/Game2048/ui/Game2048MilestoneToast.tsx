'use client';

import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface Game2048MilestoneToastProps {
  milestone: number | null;
  onDismiss: () => void;
}

export function Game2048MilestoneToast({
  milestone,
  onDismiss,
}: Game2048MilestoneToastProps) {
  const { t } = useTranslation();

  if (milestone === null) return null;

  return (
    <div
      data-testid="game-2048-milestone-toast"
      onAnimationEnd={onDismiss}
      className="fixed top-20 sm:top-22 left-1/2 -translate-x-1/2 z-[120] flex w-[calc(100%-2rem)] max-w-sm items-center justify-between gap-2.5 rounded-2xl border-2 border-amber-400/80 bg-neutral-950/95 p-2.5 sm:p-3 shadow-2xl shadow-amber-500/25 backdrop-blur-2xl ring-1 ring-amber-400/40 text-amber-100 animate-milestone-toast pointer-events-auto"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-lg shadow-md shadow-amber-500/30">
          🏆
        </span>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-extrabold text-amber-200 tracking-wide uppercase">
            {t('games.game_2048_v1.milestone.title')}
          </span>
          <span className="text-xs text-amber-100/90 font-medium truncate">
            {t('games.game_2048_v1.milestone.body', { tile: milestone })}
          </span>
        </div>
      </div>

      <Button
        size="sm"
        variant="primary"
        onClick={onDismiss}
        data-testid="game-2048-milestone-dismiss"
        className="shrink-0 h-8 px-3 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black border-none shadow-md shadow-amber-400/30 active:scale-95 transition-transform"
      >
        {t('games.game_2048_v1.milestone.keepGoing')}
      </Button>
    </div>
  );
}
