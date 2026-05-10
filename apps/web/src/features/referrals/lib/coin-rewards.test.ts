import { describe, it, expect } from 'vitest';
import { REFERRAL_COIN_REWARDS, TIER_COIN_BONUS } from './coin-rewards';

describe('REFERRAL_COIN_REWARDS', () => {
  it('exports the correct per-friend default (50)', () => {
    expect(REFERRAL_COIN_REWARDS.perFriend).toBe(50);
  });

  it('exports tier bonus defaults matching BE defaults (100/200/500)', () => {
    expect(REFERRAL_COIN_REWARDS.tier1Bonus).toBe(100);
    expect(REFERRAL_COIN_REWARDS.tier2Bonus).toBe(200);
    expect(REFERRAL_COIN_REWARDS.tier3Bonus).toBe(500);
  });
});

describe('TIER_COIN_BONUS', () => {
  it('maps tier 1 to 100 coins', () => {
    expect(TIER_COIN_BONUS[1]).toBe(100);
  });

  it('maps tier 2 to 200 coins', () => {
    expect(TIER_COIN_BONUS[2]).toBe(200);
  });

  it('maps tier 3 to 500 coins', () => {
    expect(TIER_COIN_BONUS[3]).toBe(500);
  });
});
