import React from 'react';
import {
  calculateBattlePassLevel,
  type BattlePassTierProgress,
} from '@/shared/lib/quests-progression';

interface BattlePassTierBarProps {
  totalXp: number;
  xpPerTier?: number;
  isPremium?: boolean;
}

export const BattlePassTierBar: React.FC<BattlePassTierBarProps> = ({
  totalXp,
  xpPerTier = 300,
  isPremium = false,
}) => {
  const progress: BattlePassTierProgress = calculateBattlePassLevel(
    totalXp,
    xpPerTier,
  );

  return (
    <div className="w-full rounded-2xl bg-[var(--card)] border border-[var(--cardBorder)] p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)] text-[var(--primaryForeground)] flex items-center justify-center font-black text-lg shadow-md">
            {progress.level}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--foreground)]">
                Tier {progress.level}
              </h3>
              {isPremium && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PREMIUM PASS
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--mutedForeground)]">
              {progress.isMaxTier
                ? 'Max Level Reached!'
                : `${progress.currentLevelXp} / ${progress.nextLevelXp} XP to Tier ${
                    progress.level + 1
                  }`}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-semibold text-[var(--foreground)]">
            {progress.progressPct}%
          </span>
        </div>
      </div>

      <div className="w-full h-3 rounded-full bg-[var(--surface)] border border-[var(--glassBorder)] overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full transition-all duration-500 ${
            progress.progressPct >= 100
              ? 'w-full'
              : progress.progressPct >= 75
                ? 'w-3/4'
                : progress.progressPct >= 50
                  ? 'w-1/2'
                  : progress.progressPct >= 25
                    ? 'w-1/4'
                    : progress.progressPct > 0
                      ? 'w-1/12'
                      : 'w-0'
          }`}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--mutedForeground)] pt-1">
        <span>Tier {progress.level} Rewards</span>
        <span>
          Next Milestone: Tier {Math.min(50, Math.ceil(progress.level / 5) * 5)}
        </span>
      </div>
    </div>
  );
};
