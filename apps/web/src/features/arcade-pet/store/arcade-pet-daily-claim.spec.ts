import { beforeEach, describe, expect, it } from 'vitest';
import { claimDailyBonus } from './arcade-pet-daily-claim';
import { useArcadePetStore } from './useArcadePetStore';

const DAY = 24 * 60 * 60 * 1000;
const noon = new Date(2026, 10, 15, 12).getTime();

function claim(now: number) {
  return claimDailyBonus(
    () => useArcadePetStore.getState(),
    (partial) => useArcadePetStore.setState(partial),
    now,
  );
}

describe('claimDailyBonus', () => {
  beforeEach(() => {
    localStorage.clear();
    useArcadePetStore.setState({
      coinBalance: 10,
      dailyStreak: 0,
      lastDailyClaimDay: null,
    });
  });

  it('grants coins once per day', () => {
    const first = claim(noon);
    expect(first).toEqual({ success: true, coins: 5, streak: 1 });
    expect(useArcadePetStore.getState().coinBalance).toBe(15);

    const second = claim(noon + 60_000);
    expect(second.success).toBe(false);
    expect(useArcadePetStore.getState().coinBalance).toBe(15);
  });

  it('builds a streak across consecutive days', () => {
    claim(noon);
    const next = claim(noon + DAY);
    expect(next).toEqual({ success: true, coins: 7, streak: 2 });
  });

  it('resets the streak after a missed day', () => {
    claim(noon);
    claim(noon + DAY);
    const afterGap = claim(noon + 4 * DAY);
    expect(afterGap.streak).toBe(1);
  });
});
