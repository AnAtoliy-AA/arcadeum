'use client';

import type { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useSoundSetting } from '@/shared/hooks/useSoundSetting';
import { useMusicSetting } from '@/shared/hooks/useMusicSetting';
import type { SoloPauseState } from './useSoloPause';

export interface SoloControlPanelProps {
  pause: SoloPauseState;
  finishedAt: number | null;
  controls?: ReactNode;
  actions?: ReactNode;
  isFullscreen?: boolean;
  className?: string;
  showLeaderboard?: boolean;
  onToggleLeaderboard?: () => void;
}

export function SoloControlPanel({
  pause,
  finishedAt,
  controls,
  actions,
  className,
  showLeaderboard,
  onToggleLeaderboard,
}: SoloControlPanelProps) {
  const { t } = useTranslation();
  const { isPaused, togglePause, autoPauseEnabled, toggleAutoPause } = pause;
  const isFinished = finishedAt !== null;
  const { soundEnabled, setSoundEnabled } = useSoundSetting();
  const { musicEnabled, setMusicEnabled } = useMusicSetting();

  return (
    <div
      data-testid="solo-control-panel"
      className={cx(
        'flex w-full flex-wrap items-center justify-between gap-1.5 sm:gap-2 border-t border-[var(--glassBorder)] pt-1.5',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 min-w-0 max-w-full">
        <button
          type="button"
          onClick={togglePause}
          disabled={isFinished}
          aria-label={isPaused ? 'Play game' : 'Pause game'}
          data-testid="solo-pause-button"
          title={
            isFinished
              ? t('games.soloControls.gameOver') || 'Game over'
              : isPaused
                ? `${t('games.soloControls.play') || 'Play'} (P)`
                : `${t('games.soloControls.pause') || 'Pause'} (P)`
          }
          className={cx(
            'inline-flex items-center justify-center gap-1 rounded-lg border px-2.5 h-7.5 text-xs font-bold transition-all shadow-xs active:scale-95 select-none',
            isPaused
              ? 'border-amber-500/60 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 ring-1 ring-amber-500/40'
              : 'border-[var(--primary)]/50 bg-[var(--primary)] text-[var(--primaryForeground,white)] hover:bg-[var(--primary)]/90',
            isFinished && 'opacity-40 cursor-not-allowed',
          )}
        >
          <span>{isPaused ? '▶️' : '⏸️'}</span>
          <span>
            {isPaused
              ? t('games.soloControls.play') || 'Play'
              : t('games.soloControls.pause') || 'Pause'}
          </span>
        </button>

        <button
          type="button"
          onClick={toggleAutoPause}
          aria-label="Toggle auto-pause on idle"
          aria-pressed={autoPauseEnabled}
          data-testid="solo-autopause-control-button"
          title={
            autoPauseEnabled
              ? 'Auto-pause on idle: ON (45s)'
              : 'Auto-pause on idle: OFF'
          }
          className={cx(
            'inline-flex items-center justify-center gap-1 rounded-lg border px-2 h-7.5 text-xs font-semibold transition-colors shadow-xs active:scale-95 select-none',
            autoPauseEnabled
              ? 'border-[var(--primary)]/40 bg-[var(--primary)]/15 text-[var(--primary)] hover:bg-[var(--primary)]/25'
              : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--textSecondary)] hover:text-[var(--color)] hover:border-[var(--glassBorderStrong)]',
          )}
        >
          <span>⏱️</span>
          <span className="hidden sm:inline">
            {t('games.soloControls.autoPause') || 'Auto-pause:'}
          </span>
          <span className="sm:hidden">
            {t('games.soloControls.auto') || 'Auto:'}
          </span>
          <span className="font-bold">
            {autoPauseEnabled
              ? t('games.soloControls.on') || 'ON'
              : t('games.soloControls.off') || 'OFF'}
          </span>
        </button>

        {controls}
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {actions}
        <div className="flex items-center rounded-lg border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-0.5 h-7.5 shadow-xs">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={
              soundEnabled ? 'Disable sound effects' : 'Enable sound effects'
            }
            aria-pressed={soundEnabled}
            data-testid="solo-sound-toggle-button"
            title={soundEnabled ? 'Sound effects: ON' : 'Sound effects: OFF'}
            className={cx(
              'flex items-center justify-center h-6.5 px-1.5 text-xs font-semibold rounded-md transition-colors active:scale-95 select-none',
              soundEnabled
                ? 'bg-[var(--glassBg)] text-[var(--primary)] shadow-xs'
                : 'text-[var(--textSecondary)] opacity-60 hover:opacity-100 hover:text-[var(--color)]',
            )}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          <button
            type="button"
            onClick={() => setMusicEnabled(!musicEnabled)}
            aria-label={musicEnabled ? 'Disable music' : 'Enable music'}
            aria-pressed={musicEnabled}
            data-testid="solo-music-toggle-button"
            title={musicEnabled ? 'Music: ON' : 'Music: OFF'}
            className={cx(
              'flex items-center justify-center h-6.5 px-1.5 text-xs font-semibold rounded-md transition-colors active:scale-95 select-none',
              musicEnabled
                ? 'bg-[var(--glassBg)] text-[var(--primary)] shadow-xs'
                : 'text-[var(--textSecondary)] opacity-60 hover:opacity-100 hover:text-[var(--color)]',
            )}
          >
            🎵
          </button>
        </div>

        {onToggleLeaderboard && (
          <button
            type="button"
            onClick={onToggleLeaderboard}
            aria-label={
              showLeaderboard ? 'Hide leaderboard' : 'Show leaderboard'
            }
            aria-pressed={showLeaderboard}
            data-testid="solo-leaderboard-toggle-button"
            title={showLeaderboard ? 'Hide leaderboard' : 'Show leaderboard'}
            className={cx(
              'inline-flex items-center justify-center gap-1 rounded-lg border px-2 h-7.5 text-xs font-semibold transition-colors shadow-xs active:scale-95 select-none',
              showLeaderboard
                ? 'border-[var(--primary)]/40 bg-[var(--primary)]/15 text-[var(--primary)] hover:bg-[var(--primary)]/25'
                : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--textSecondary)] hover:text-[var(--color)] hover:border-[var(--glassBorderStrong)]',
            )}
          >
            <span>🏆</span>
            <span className="hidden sm:inline font-medium">
              {t('games.soloControls.leaderboard') || 'Leaderboard'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
