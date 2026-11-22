import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialPet } from '@arcadeum/games-core';
import { checkMilestones } from './arcade-pet-milestone-claim';
import { useArcadePetStore } from './useArcadePetStore';

function run() {
  checkMilestones(
    () => useArcadePetStore.getState(),
    (partial) => useArcadePetStore.setState(partial),
  );
}

describe('checkMilestones', () => {
  beforeEach(() => {
    localStorage.clear();
    const pet = {
      ...createInitialPet({ id: 'p1', name: 'Bit' }),
      stage: 'baby' as const,
    };
    useArcadePetStore.setState({
      pet,
      pets: [pet],
      activePetId: 'p1',
      coinBalance: 0,
      dailyStreak: 0,
      claimedMilestones: [],
      newMilestones: [],
      hasConfirmedCare: true,
    });
  });

  it('rewards a new milestone once', () => {
    run();
    const first = useArcadePetStore.getState();
    expect(first.claimedMilestones).toContain('first_hatch');
    expect(first.coinBalance).toBe(10);
    expect(first.newMilestones).toEqual([
      { id: 'first_hatch', rewardCoins: 10 },
    ]);

    run();
    expect(useArcadePetStore.getState().coinBalance).toBe(10);
  });

  it('does not queue or pay a milestone twice when claims were reset', () => {
    run();
    // A server response can briefly reset the claimed list.
    useArcadePetStore.setState({ claimedMilestones: [] });
    run();
    const state = useArcadePetStore.getState();
    expect(state.newMilestones).toEqual([
      { id: 'first_hatch', rewardCoins: 10 },
    ]);
    expect(state.coinBalance).toBe(10);
  });

  it('dismisses the queued notices', () => {
    run();
    useArcadePetStore.getState().dismissMilestones();
    expect(useArcadePetStore.getState().newMilestones).toEqual([]);
  });
});
