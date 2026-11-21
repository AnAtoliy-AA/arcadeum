import { describe, expect, it } from 'vitest';
import {
  canClaimDailyBonus,
  getDailyBonusCoins,
  nextDailyStreak,
  toDayKey,
} from './arcade-pet-daily-bonus';

const DAY = 24 * 60 * 60 * 1000;
const noon = new Date(2026, 10, 15, 12).getTime();

describe('daily bonus', () => {
  it('allows one claim per local day', () => {
    const state = { lastClaimDay: toDayKey(noon), streak: 1 };
    expect(canClaimDailyBonus(state, noon)).toBe(false);
    expect(canClaimDailyBonus(state, noon + DAY)).toBe(true);
    expect(canClaimDailyBonus({ lastClaimDay: null, streak: 0 }, noon)).toBe(
      true,
    );
  });

  it('extends the streak on consecutive days and resets after a gap', () => {
    const state = { lastClaimDay: toDayKey(noon), streak: 3 };
    expect(nextDailyStreak(state, noon + DAY)).toBe(4);
    expect(nextDailyStreak(state, noon + 3 * DAY)).toBe(1);
  });

  it('caps the streak and scales the reward', () => {
    const state = { lastClaimDay: toDayKey(noon), streak: 7 };
    expect(nextDailyStreak(state, noon + DAY)).toBe(7);
    expect(getDailyBonusCoins(1)).toBe(5);
    expect(getDailyBonusCoins(7)).toBe(17);
    expect(getDailyBonusCoins(99)).toBe(17);
  });
});
