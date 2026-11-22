import React from 'react';
import { Notice } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { MilestoneNotice } from '../store/arcade-pet-store-types';

interface ArcadePetMilestoneToastProps {
  notices: MilestoneNotice[];
  onDismiss: () => void;
}

export const ArcadePetMilestoneToast: React.FC<
  ArcadePetMilestoneToastProps
> = ({ notices, onDismiss }) => {
  const { t } = useTranslation();
  if (notices.length === 0) return null;

  return (
    <Notice
      tone="warning"
      data-testid="pet-milestone-toast"
      dismissTestId="pet-milestone-dismiss"
      onDismiss={onDismiss}
      dismissLabel={t('arcadePetCompanion.awayDismiss')}
    >
      <ul className="flex flex-col gap-0.5">
        {notices.map((n) => (
          <li key={n.id}>
            {`🏆 ${t(`arcadePetCompanion.milestones.${n.id}`)} +${n.rewardCoins} 🪙`}
          </li>
        ))}
      </ul>
    </Notice>
  );
};
