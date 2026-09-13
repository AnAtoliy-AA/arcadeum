'use client';

import { AnimatedDice } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface DiceOverlayProps {
  canRoll: boolean;
  isRolling: boolean;
  isGameOver: boolean;
  actionBusy: boolean;
  die: number | null;
  lastDie: number | null;
  boardRotation: number;
  onRoll: () => void;
}

export function DiceOverlay({
  canRoll,
  isRolling,
  isGameOver,
  actionBusy,
  die,
  lastDie,
  boardRotation,
  onRoll,
}: DiceOverlayProps) {
  const { t } = useTranslation();

  return (
    <div
      className="pachisi-center-overlay pointer-events-none absolute z-20 flex items-center justify-center"
      style={{ gridRow: '6 / span 5', gridColumn: '6 / span 5' }}
    >
      <div
        className="pointer-events-auto flex flex-col items-center gap-2"
        style={{ transform: `rotate(${-boardRotation}deg)` }}
      >
        {canRoll && (
          <button
            aria-label={t('games.pachisi_v1.game.rollDice')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 px-5 py-2.5 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-emerald-500/30 transition-all duration-150 hover:scale-105 hover:shadow-emerald-500/40 hover:shadow-xl active:scale-95 disabled:opacity-50"
            data-testid="pachisi-roll-button"
            disabled={actionBusy}
            onClick={onRoll}
            type="button"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="12" height="12" rx="2" />
              <circle
                cx="5.5"
                cy="5.5"
                r="1"
                fill="currentColor"
                stroke="none"
              />
              <circle
                cx="10.5"
                cy="5.5"
                r="1"
                fill="currentColor"
                stroke="none"
              />
              <circle
                cx="5.5"
                cy="10.5"
                r="1"
                fill="currentColor"
                stroke="none"
              />
              <circle
                cx="10.5"
                cy="10.5"
                r="1"
                fill="currentColor"
                stroke="none"
              />
            </svg>
            {t('games.pachisi_v1.game.rollDice')}
          </button>
        )}

        {isRolling && <AnimatedDice isRolling size="lg" values={[1]} />}

        {!canRoll && !isRolling && die != null && (
          <div
            className="flex flex-col items-center gap-1"
            data-testid="pachisi-die-result"
          >
            <AnimatedDice size="lg" values={[die]} />
            <span className="rounded-lg border border-white/20 bg-black/50 px-2.5 py-0.5 text-base font-black text-white shadow-md backdrop-blur-sm">
              {die}
            </span>
          </div>
        )}

        {!canRoll &&
          !isRolling &&
          die == null &&
          lastDie != null &&
          !isGameOver && (
            <div className="flex flex-col items-center gap-1 opacity-60">
              <AnimatedDice size="md" values={[lastDie]} />
              <span className="text-[10px] font-semibold text-white/60">
                {t('games.pachisi_v1.game.lastRoll', { value: lastDie })}
              </span>
            </div>
          )}
      </div>
    </div>
  );
}
