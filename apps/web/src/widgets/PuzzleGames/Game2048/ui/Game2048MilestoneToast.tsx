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
      className="flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 p-3 shadow-xl backdrop-blur-xl ring-1 ring-amber-400/40 text-amber-100 animate-in fade-in slide-in-from-top-2 duration-300"
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
        className="shrink-0 h-8 px-3 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black border-none shadow-md shadow-amber-400/30"
      >
        {t('games.game_2048_v1.milestone.keepGoing')}
      </Button>
    </div>
  );
}
