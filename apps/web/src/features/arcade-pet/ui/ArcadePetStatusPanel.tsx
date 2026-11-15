import React from 'react';
import { ProgressBar } from '@arcadeum/ui';
import { getGrowthSpeedPercent, type PetState } from '@arcadeum/games-core';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface ArcadePetStatusPanelProps {
  pet: PetState;
  isAtHome: boolean;
}

export const ArcadePetStatusPanel: React.FC<ArcadePetStatusPanelProps> = ({
  pet,
  isAtHome,
}) => {
  const { t } = useTranslation();
  return (
    <>
      {isAtHome ? (
        <div
          data-testid="pet-home-resting-banner"
          className="text-[11px] text-amber-200 font-medium text-center bg-amber-950/40 border border-amber-500/30 rounded py-1 px-2 flex items-center justify-center gap-1"
        >
          <span>🏠</span>
          <span>{t('arcadePetCompanion.restingBanner')}</span>
        </div>
      ) : (
        <div
          data-testid="pet-running-banner"
          className="text-[11px] text-emerald-300 font-medium text-center bg-emerald-950/30 border border-emerald-500/30 rounded py-1 px-2 flex items-center justify-center gap-1"
        >
          <span>⚡</span>
          <span>{t('arcadePetCompanion.runningBanner')}</span>
        </div>
      )}

      <div className="flex flex-col gap-2 text-xs">
        <div className="flex justify-between text-[11px] text-neutral-400">
          <span>{t('arcadePetCompanion.hunger')}</span>
          <span className="font-bold text-neutral-200">
            {pet.stats.hunger}%
          </span>
        </div>
        <ProgressBar value={pet.stats.hunger} height={6} color="#f59e0b" />

        <div className="flex justify-between text-[11px] text-neutral-400 pt-1">
          <span>{t('arcadePetCompanion.happiness')}</span>
          <span className="font-bold text-neutral-200">
            {pet.stats.happiness}%
          </span>
        </div>
        <ProgressBar value={pet.stats.happiness} height={6} color="#f43f5e" />

        <div
          data-testid="pet-growth-rate-badge"
          className="flex items-center justify-between text-[11px] px-2 py-1 rounded bg-neutral-950/70 border border-neutral-800"
        >
          <span className="text-neutral-400">
            {t('arcadePetCompanion.growthSpeed')}
          </span>
          <span
            className={`font-bold ${
              isAtHome
                ? 'text-neutral-400'
                : getGrowthSpeedPercent(pet.stats.hunger, isAtHome) >= 70
                  ? 'text-emerald-400'
                  : 'text-amber-400'
            }`}
          >
            {isAtHome
              ? t('arcadePetCompanion.pausedAtHome')
              : `${getGrowthSpeedPercent(pet.stats.hunger, isAtHome)}%`}
            {!isAtHome && pet.stats.hunger < 25
              ? t('arcadePetCompanion.hungryWarning')
              : ''}
          </span>
        </div>
      </div>
    </>
  );
};
