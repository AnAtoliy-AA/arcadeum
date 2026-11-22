import React from 'react';
import {
  formatAwayDuration,
  type AwaySummary,
} from '../lib/arcade-pet-away-summary';
import { stageTranslationKey } from '../lib/arcade-pet-stage-key';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface ArcadePetAwayBannerProps {
  summary: AwaySummary;
  onDismiss: () => void;
}

export const ArcadePetAwayBanner: React.FC<ArcadePetAwayBannerProps> = ({
  summary,
  onDismiss,
}) => {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      data-testid="pet-away-summary"
      className="text-xs text-sky-200 text-center bg-sky-950/40 border border-sky-500/30 rounded py-1.5 px-2 flex flex-col gap-1"
    >
      <span>
        {t('arcadePetCompanion.awaySummary', {
          duration: formatAwayDuration(summary.awayMs),
          name: summary.petName,
          hunger: summary.hungerDrop,
          hours: summary.growthHoursGained,
        })}
        {summary.stageBefore !== summary.stageAfter
          ? ` ${t('arcadePetCompanion.awayEvolved', { stage: t(stageTranslationKey(summary.stageAfter)) })}`
          : ''}
      </span>
      <button
        type="button"
        data-testid="pet-away-summary-dismiss"
        onClick={onDismiss}
        className="self-center px-2 py-0.5 rounded-full border border-sky-400/50 font-bold text-xs uppercase"
      >
        {t('arcadePetCompanion.awayDismiss')}
      </button>
    </div>
  );
};
