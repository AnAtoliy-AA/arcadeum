import {
  canClaimDailyBonus,
  getDailyBonusCoins,
  nextDailyStreak,
  toDayKey,
} from '../lib/arcade-pet-daily-bonus';
import { persistStore } from './arcade-pet-storage';
import type { ArcadePetStoreState } from './arcade-pet-store-types';

type Getter = () => ArcadePetStoreState;
type Setter = (partial: Partial<ArcadePetStoreState>) => void;

export function claimDailyBonus(
  get: Getter,
  set: Setter,
  now: number = Date.now(),
): { success: boolean; coins: number; streak: number } {
  const { lastDailyClaimDay, dailyStreak, coinBalance } = get();
  const state = { lastClaimDay: lastDailyClaimDay, streak: dailyStreak };
  if (!canClaimDailyBonus(state, now)) {
    return { success: false, coins: 0, streak: dailyStreak };
  }
  const streak = nextDailyStreak(state, now);
  const coins = getDailyBonusCoins(streak);
  const next = {
    coinBalance: coinBalance + coins,
    dailyStreak: streak,
    lastDailyClaimDay: toDayKey(now),
  };
  set(next);
  persistStore({ ...get(), ...next });
  return { success: true, coins, streak };
}
