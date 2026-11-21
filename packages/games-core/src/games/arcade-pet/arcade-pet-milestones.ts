import type { PetState } from './arcade-pet.types';

export type MilestoneId =
  'first_hatch' | 'level_5' | 'level_10' | 'collector_3' | 'streak_7';

export interface MilestoneContext {
  pets: PetState[];
  dailyStreak: number;
}

export interface MilestoneDefinition {
  id: MilestoneId;
  rewardCoins: number;
  isReached: (ctx: MilestoneContext) => boolean;
}

const highestLevel = (pets: PetState[]) =>
  pets.reduce((max, p) => Math.max(max, p.stats.level), 0);

export const MILESTONES: readonly MilestoneDefinition[] = [
  {
    id: 'first_hatch',
    rewardCoins: 10,
    isReached: ({ pets }) => pets.some((p) => p.stage !== 'egg'),
  },
  {
    id: 'level_5',
    rewardCoins: 20,
    isReached: ({ pets }) => highestLevel(pets) >= 5,
  },
  {
    id: 'level_10',
    rewardCoins: 50,
    isReached: ({ pets }) => highestLevel(pets) >= 10,
  },
  {
    id: 'collector_3',
    rewardCoins: 40,
    isReached: ({ pets }) => pets.length >= 3,
  },
  {
    id: 'streak_7',
    rewardCoins: 30,
    isReached: ({ dailyStreak }) => dailyStreak >= 7,
  },
];

/** Milestones reached by the player that have not been rewarded yet. */
export function getNewMilestones(
  ctx: MilestoneContext,
  claimedIds: readonly string[],
): MilestoneDefinition[] {
  return MILESTONES.filter(
    (m) => !claimedIds.includes(m.id) && m.isReached(ctx),
  );
}
