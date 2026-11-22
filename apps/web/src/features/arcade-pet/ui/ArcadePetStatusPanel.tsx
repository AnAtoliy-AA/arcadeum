import React from 'react';
import { Notice, ProgressBar } from '@arcadeum/ui';
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
  const growthPercent = getGrowthSpeedPercent(pet.stats.hunger, isAtHome);
  return (
    <>
      {isAtHome ? (
        <Notice
          tone="warning"
          icon="🏠"
          data-testid="pet-home-resting-banner"
          className="text-center font-medium"
        >
          {t('arcadePetCompanion.restingBanner')}
        </Notice>
      ) : (
        <Notice
          tone="success"
          icon="⚡"
          data-testid="pet-running-banner"
          className="text-center font-medium"
        >
          {t('arcadePetCompanion.runningBanner')}
        </Notice>
      )}

      <div className="flex flex-col gap-2 text-xs">
        <div className="flex justify-between text-xs text-[var(--textSecondary)]">
          <span>{t('arcadePetCompanion.hunger')}</span>
          <span className="font-bold text-[var(--color)]">
            {pet.stats.hunger}%
          </span>
        </div>
        <ProgressBar
          value={pet.stats.hunger}
          height={6}
          color="var(--warning)"
          ariaLabel={t('arcadePetCompanion.hunger')}
        />

        <div className="flex justify-between pt-1 text-xs text-[var(--textSecondary)]">
          <span>{t('arcadePetCompanion.happiness')}</span>
          <span className="font-bold text-[var(--color)]">
            {pet.stats.happiness}%
          </span>
        </div>
        <ProgressBar
          value={pet.stats.happiness}
          height={6}
          color="var(--danger)"
          ariaLabel={t('arcadePetCompanion.happiness')}
        />

        <div
          data-testid="pet-growth-rate-badge"
          className="flex items-center justify-between rounded border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-2 py-1 text-xs"
        >
          <span className="text-[var(--textSecondary)]">
            {t('arcadePetCompanion.growthSpeed')}
          </span>
          <span
            className={`font-bold ${
              isAtHome ? 'text-[var(--textSecondary)]' : 'text-[var(--color)]'
            }`}
          >
            {isAtHome
              ? t('arcadePetCompanion.pausedAtHome')
              : `${growthPercent}%`}
            {!isAtHome && pet.stats.hunger < 25
              ? t('arcadePetCompanion.hungryWarning')
              : ''}
          </span>
        </div>
      </div>
    </>
  );
};
