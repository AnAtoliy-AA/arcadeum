import React from 'react';
import { Notice } from '@arcadeum/ui';
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
    <Notice
      tone="info"
      data-testid="pet-away-summary"
      dismissTestId="pet-away-summary-dismiss"
      onDismiss={onDismiss}
      dismissLabel={t('arcadePetCompanion.awayDismiss')}
      className="text-center"
    >
      {t('arcadePetCompanion.awaySummary', {
        duration: formatAwayDuration(summary.awayMs),
        name: summary.petName,
        hunger: summary.hungerDrop,
        hours: summary.growthHoursGained,
      })}
      {summary.stageBefore !== summary.stageAfter
        ? ` ${t('arcadePetCompanion.awayEvolved', { stage: t(stageTranslationKey(summary.stageAfter)) })}`
        : ''}
    </Notice>
  );
};
