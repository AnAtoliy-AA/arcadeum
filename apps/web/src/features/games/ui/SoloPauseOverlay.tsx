'use client';

import { cx } from '@arcadeum/ui/utils/cx';
import type { SoloPauseState } from './useSoloPause';

export function SoloPauseOverlay({ pause }: { pause: SoloPauseState }) {
  const { isIdlePaused, autoPauseEnabled, resumeGame, toggleAutoPause } = pause;

  return (
    <div
      data-testid="solo-pause-overlay"
      className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-[var(--glassBorder)] bg-black/60 p-4 sm:p-6 backdrop-blur-sm shadow-2xl animate-in fade-in duration-200"
    >
      <div className="flex flex-col items-center gap-4 max-w-sm text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--warning)]/30 bg-[var(--warning)]/15 text-3xl text-[var(--warning)] shadow-lg shadow-[var(--warning)]/20">
          ⏸️
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-black text-[var(--color)]">
            {isIdlePaused ? 'Paused on Idle' : 'Game Paused'}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-[var(--textSecondary)]">
            {isIdlePaused
              ? 'Game paused automatically due to inactivity'
              : 'Timer paused. Press Resume or (P) to continue'}
          </p>
        </div>

        <button
          type="button"
          onClick={resumeGame}
          data-testid="solo-resume-button"
          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--primary)]/40 bg-[var(--primary)] px-6 py-2.5 text-sm font-bold text-[var(--primaryText)] shadow-lg shadow-[var(--primary)]/25 transition-transform hover:scale-105 active:scale-95"
        >
          <span>▶️</span>
          <span>Resume</span>
        </button>

        <div className="flex items-center gap-2 pt-2 text-xs text-[var(--textSecondary)]">
          <label
            htmlFor="solo-autopause-toggle"
            className="cursor-pointer select-none font-medium"
          >
            Auto-pause on idle
          </label>
          <button
            type="button"
            id="solo-autopause-toggle"
            role="switch"
            aria-checked={autoPauseEnabled}
            data-testid="solo-autopause-toggle"
            onClick={toggleAutoPause}
            className={cx(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
              autoPauseEnabled
                ? 'bg-[var(--success)]'
                : 'bg-[var(--neutral)]/40',
            )}
          >
            <span
              className={cx(
                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                autoPauseEnabled ? 'translate-x-4' : 'translate-x-0',
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
