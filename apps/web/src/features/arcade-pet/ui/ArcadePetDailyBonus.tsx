import React from 'react';
import { Button } from '@arcadeum/ui';
import {
  canClaimDailyBonus,
  getDailyBonusCoins,
  nextDailyStreak,
} from '@arcadeum/games-core';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useNow } from '../lib/useNow';

interface ArcadePetDailyBonusProps {
  lastClaimDay: string | null;
  streak: number;
  onClaim: () => void;
}

export const ArcadePetDailyBonus: React.FC<ArcadePetDailyBonusProps> = ({
  lastClaimDay,
  streak,
  onClaim,
}) => {
  const { t } = useTranslation();
  const state = { lastClaimDay, streak };
  // Shared clock: re-derived on focus, visibility and a slow tick, so the
  // bonus reappears after midnight without a remount.
  const now = useNow();

  if (!canClaimDailyBonus(state, now)) return null;
  const coins = getDailyBonusCoins(nextDailyStreak(state, now));

  return (
    <Button
      variant="primary"
      size="sm"
      fullWidth
      data-testid="companion-daily-bonus-btn"
      onClick={onClaim}
      className="text-xs uppercase"
    >
      {t('arcadePetCompanion.dailyBonus', { coins })}
    </Button>
  );
};
