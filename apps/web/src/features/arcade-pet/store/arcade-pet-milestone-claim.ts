import { getNewMilestones } from '@arcadeum/games-core';
import { persistStore } from './arcade-pet-storage';
import { sendEconomyAction } from './arcade-pet-server-actions';
import type { ArcadePetStoreState } from './arcade-pet-store-types';

type Getter = () => ArcadePetStoreState;
type Setter = (partial: Partial<ArcadePetStoreState>) => void;

/** Grants coins for newly reached milestones and queues them for the toast. */
export function checkMilestones(get: Getter, set: Setter): void {
  const { pets, dailyStreak, claimedMilestones, coinBalance, newMilestones } =
    get();
  if (pets.length === 0) return;

  // Milestones already waiting in the toast must not be queued (or paid)
  // again when a server response briefly resets `claimedMilestones`.
  const queued = new Set(newMilestones.map((m) => m.id));
  const reached = getNewMilestones(
    { pets, dailyStreak },
    claimedMilestones,
  ).filter((m) => !queued.has(m.id));
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
  void sendEconomyAction(get, set, { type: 'claim_milestones' });
}
