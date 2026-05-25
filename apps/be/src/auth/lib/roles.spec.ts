import { canSeeAtTier, VISIBILITY_TIERS } from './roles';

describe('canSeeAtTier', () => {
  it('all tier is visible to everyone, including free', () => {
    expect(canSeeAtTier('free', 'all')).toBe(true);
    expect(canSeeAtTier('admin', 'all')).toBe(true);
  });

  it('premium_plus is visible to premium and higher-priority roles, not to free', () => {
    expect(canSeeAtTier('free', 'premium_plus')).toBe(false);
    expect(canSeeAtTier('premium', 'premium_plus')).toBe(true);
    expect(canSeeAtTier('supporter', 'premium_plus')).toBe(true); // priority 15 >= 10
    expect(canSeeAtTier('vip', 'premium_plus')).toBe(true);
    expect(canSeeAtTier('moderator', 'premium_plus')).toBe(true);
    expect(canSeeAtTier('admin', 'premium_plus')).toBe(true);
  });

  it('vip_plus is visible to vip and higher-priority roles, not to premium or supporter', () => {
    expect(canSeeAtTier('free', 'vip_plus')).toBe(false);
    expect(canSeeAtTier('premium', 'vip_plus')).toBe(false);
    expect(canSeeAtTier('supporter', 'vip_plus')).toBe(false); // priority 15 < 20
    expect(canSeeAtTier('vip', 'vip_plus')).toBe(true);
    expect(canSeeAtTier('tester', 'vip_plus')).toBe(true);
    expect(canSeeAtTier('moderator', 'vip_plus')).toBe(true);
    expect(canSeeAtTier('admin', 'vip_plus')).toBe(true);
  });

  it('exposes the canonical tier list', () => {
    expect(VISIBILITY_TIERS).toEqual([
      'all',
      'premium_plus',
      'vip_plus',
      'developers_plus',
      'none',
    ]);
  });
});

describe('canSeeAtTier (new tiers)', () => {
  it('developers_plus admits developer and admin only', () => {
    expect(canSeeAtTier('developer', 'developers_plus')).toBe(true);
    expect(canSeeAtTier('admin', 'developers_plus')).toBe(true);
    expect(canSeeAtTier('moderator', 'developers_plus')).toBe(false);
    expect(canSeeAtTier('tester', 'developers_plus')).toBe(false);
    expect(canSeeAtTier('vip', 'developers_plus')).toBe(false);
    expect(canSeeAtTier('free', 'developers_plus')).toBe(false);
  });

  it('none admits nobody', () => {
    expect(canSeeAtTier('admin', 'none')).toBe(false);
    expect(canSeeAtTier('developer', 'none')).toBe(false);
    expect(canSeeAtTier('vip', 'none')).toBe(false);
    expect(canSeeAtTier('free', 'none')).toBe(false);
  });
});
