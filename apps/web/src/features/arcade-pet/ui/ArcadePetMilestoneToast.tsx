import React from 'react';
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
    <div
      role="status"
      data-testid="pet-milestone-toast"
      className="text-[11px] text-amber-100 bg-amber-950/50 border border-amber-500/40 rounded py-1.5 px-2 flex flex-col gap-1"
    >
      <ul className="flex flex-col gap-0.5">
        {notices.map((n) => (
          <li key={n.id}>
            {`🏆 ${t(`arcadePetCompanion.milestones.${n.id}`)} +${n.rewardCoins} 🪙`}
          </li>
        ))}
      </ul>
      <button
        type="button"
        data-testid="pet-milestone-dismiss"
        onClick={onDismiss}
        className="self-center px-2 py-0.5 rounded-full border border-amber-400/50 font-bold text-[10px] uppercase"
      >
        {t('arcadePetCompanion.awayDismiss')}
      </button>
    </div>
  );
};
