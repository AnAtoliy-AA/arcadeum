import React from 'react';
import {
  formatAwayDuration,
  type AwaySummary,
} from '../lib/arcade-pet-away-summary';

interface ArcadePetAwayBannerProps {
  summary: AwaySummary;
  onDismiss: () => void;
}

export const ArcadePetAwayBanner: React.FC<ArcadePetAwayBannerProps> = ({
  summary,
  onDismiss,
}) => (
  <div
    role="status"
    data-testid="pet-away-summary"
    className="text-[11px] text-sky-200 text-center bg-sky-950/40 border border-sky-500/30 rounded py-1.5 px-2 flex flex-col gap-1"
  >
    <span>
      {`While you were away (${formatAwayDuration(summary.awayMs)}), ${summary.petName} lost ${summary.hungerDrop} hunger and grew ${summary.growthHoursGained}h.`}
      {summary.stageBefore !== summary.stageAfter
        ? ` Now a ${summary.stageAfter}!`
        : ''}
    </span>
    <button
      type="button"
      data-testid="pet-away-summary-dismiss"
      onClick={onDismiss}
      className="self-center px-2 py-0.5 rounded-full border border-sky-400/50 font-bold text-[10px] uppercase"
    >
      Got it
    </button>
  </div>
);
