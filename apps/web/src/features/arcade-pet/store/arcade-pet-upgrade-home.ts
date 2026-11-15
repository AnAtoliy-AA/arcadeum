import { getHomeUpgradeCost } from '../lib/arcade-pet-economy';
import { persistStore } from './arcade-pet-storage';
import type { ArcadePetStoreState } from './arcade-pet-store-types';

type Getter = () => ArcadePetStoreState;
type Setter = (partial: Partial<ArcadePetStoreState>) => void;

export function upgradeHome(
  get: Getter,
  set: Setter,
  currency: 'coins' | 'gems',
): { success: boolean; error?: string } {
  const { homeCapacity, coinBalance, gemBalance } = get();
  const cost = getHomeUpgradeCost(homeCapacity);
  if (currency === 'coins') {
    if (coinBalance < cost.coinCost) {
      set({
        actionError: {
          code: 'NEED_COINS_UPGRADE',
          params: { cost: cost.coinCost },
        },
      });
      return { success: false, error: 'INSUFFICIENT_COINS' };
    }
    const nextCoins = coinBalance - cost.coinCost;
    const nextCap = homeCapacity + 1;
    set({
      coinBalance: nextCoins,
      homeCapacity: nextCap,
      actionError: null,
    });
    persistStore({ ...get(), coinBalance: nextCoins, homeCapacity: nextCap });
    return { success: true };
  }
  if (gemBalance < cost.gemCost) {
    set({
      actionError: {
        code: 'NEED_GEMS_UPGRADE',
        params: { cost: cost.gemCost },
      },
    });
    return { success: false, error: 'INSUFFICIENT_GEMS' };
  }
  const nextGems = gemBalance - cost.gemCost;
  const nextCap = homeCapacity + 1;
  set({ gemBalance: nextGems, homeCapacity: nextCap, actionError: null });
  persistStore({ ...get(), gemBalance: nextGems, homeCapacity: nextCap });
  return { success: true };
}
