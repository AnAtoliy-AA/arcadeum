import { describe, expect, it } from 'vitest';
import { createInitialPet, type PetState } from '@arcadeum/games-core';
import { getNewMilestones } from './arcade-pet-milestones';

function makePet(id: string, overrides: Partial<PetState> = {}): PetState {
  const base = createInitialPet({ id, name: id, species: 'dragon' });
  return { ...base, ...overrides };
}

const ids = (list: { id: string }[]) => list.map((m) => m.id);

describe('getNewMilestones', () => {
  it('returns nothing for a fresh egg', () => {
    const pet = makePet('a', { stage: 'egg' });
    expect(getNewMilestones({ pets: [pet], dailyStreak: 0 }, [])).toEqual([]);
  });

  it('rewards hatching, levels, collection and streaks', () => {
    const strong = makePet('a', { stage: 'baby' });
    strong.stats = { ...strong.stats, level: 10 };
    const pets = [strong, makePet('b'), makePet('c')];
    expect(ids(getNewMilestones({ pets, dailyStreak: 7 }, [])).sort()).toEqual(
      ['collector_3', 'first_hatch', 'level_10', 'level_5', 'streak_7'].sort(),
    );
  });

  it('skips milestones that were already claimed', () => {
    const pet = makePet('a', { stage: 'baby' });
    expect(
      getNewMilestones({ pets: [pet], dailyStreak: 0 }, ['first_hatch']),
    ).toEqual([]);
  });
});
