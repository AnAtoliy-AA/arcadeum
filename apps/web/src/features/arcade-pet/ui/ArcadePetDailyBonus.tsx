import React, { useState } from 'react';
import {
  canClaimDailyBonus,
  getDailyBonusCoins,
  nextDailyStreak,
} from '../lib/arcade-pet-daily-bonus';

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
  const state = { lastClaimDay, streak };
  const [now] = useState(() => Date.now());
  if (!canClaimDailyBonus(state, now)) return null;
  const coins = getDailyBonusCoins(nextDailyStreak(state, now));

  return (
    <button
      type="button"
      data-testid="companion-daily-bonus-btn"
      onClick={onClaim}
      className="w-full py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-[11px] uppercase shadow-md"
    >
      {`Claim daily bonus: +${coins} coins`}
    </button>
  );
};
