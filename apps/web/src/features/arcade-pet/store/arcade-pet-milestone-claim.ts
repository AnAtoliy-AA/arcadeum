import { getNewMilestones } from '../lib/arcade-pet-milestones';
import { persistStore } from './arcade-pet-storage';
import type { ArcadePetStoreState } from './arcade-pet-store-types';

type Getter = () => ArcadePetStoreState;
type Setter = (partial: Partial<ArcadePetStoreState>) => void;

/** Grants coins for newly reached milestones and queues them for the toast. */
export function checkMilestones(get: Getter, set: Setter): void {
  const { pets, dailyStreak, claimedMilestones, coinBalance, newMilestones } =
    get();
  if (pets.length === 0) return;

  const reached = getNewMilestones({ pets, dailyStreak }, claimedMilestones);
  if (reached.length === 0) return;

  const reward = reached.reduce((sum, m) => sum + m.rewardCoins, 0);
  const next = {
    coinBalance: coinBalance + reward,
    claimedMilestones: [...claimedMilestones, ...reached.map((m) => m.id)],
    newMilestones: [
      ...newMilestones,
      ...reached.map((m) => ({ id: m.id, rewardCoins: m.rewardCoins })),
    ],
  };
  set(next);
  persistStore({ ...get(), ...next });
}
