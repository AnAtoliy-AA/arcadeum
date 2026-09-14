import { Types } from 'mongoose';
import {
  LEVEL_BADGE_REWARDS,
  getBadgesUnlockedAtLevel,
  getRewardForExactLevel,
  grantLevelBadges,
} from './level-rewards';

describe('level-rewards', () => {
  it('defines 21 milestone level rewards across levels 1 to 99', () => {
    expect(LEVEL_BADGE_REWARDS.length).toBe(21);
    expect(LEVEL_BADGE_REWARDS[0].level).toBe(1);
    expect(LEVEL_BADGE_REWARDS[0].badgeId).toBe('badge-newcomer');
    expect(LEVEL_BADGE_REWARDS[LEVEL_BADGE_REWARDS.length - 1].level).toBe(99);
    expect(LEVEL_BADGE_REWARDS[LEVEL_BADGE_REWARDS.length - 1].badgeId).toBe(
      'badge-mythic',
    );
  });

  it('getBadgesUnlockedAtLevel returns badges up to given level', () => {
    expect(getBadgesUnlockedAtLevel(1)).toEqual(['badge-newcomer']);
    expect(getBadgesUnlockedAtLevel(4)).toEqual(['badge-newcomer']);
    expect(getBadgesUnlockedAtLevel(5)).toEqual([
      'badge-newcomer',
      'badge-scout',
    ]);
    expect(getBadgesUnlockedAtLevel(10)).toEqual([
      'badge-newcomer',
      'badge-scout',
      'badge-veteran',
    ]);
    expect(getBadgesUnlockedAtLevel(35)).toContain('badge-paladin');
    expect(getBadgesUnlockedAtLevel(45)).toContain('badge-juggernaut');
    expect(getBadgesUnlockedAtLevel(55)).toContain('badge-paragon');
    expect(getBadgesUnlockedAtLevel(65)).toContain('badge-titan');
    expect(getBadgesUnlockedAtLevel(80)).toContain('badge-archon');
    expect(getBadgesUnlockedAtLevel(99).length).toBe(21);
  });

  it('getRewardForExactLevel returns reward only on exact milestone', () => {
    expect(getRewardForExactLevel(5)?.badgeId).toBe('badge-scout');
    expect(getRewardForExactLevel(7)).toBeUndefined();
    expect(getRewardForExactLevel(99)?.badgeId).toBe('badge-mythic');
  });

  it('grantLevelBadges invokes bulkWrite with upsert ops for eligible badges', async () => {
    interface BulkWriteItem {
      updateOne: {
        filter: { itemId: string };
        upsert: boolean;
      };
    }
    const mockBulkWrite = jest
      .fn<Promise<{ ok: number }>, [BulkWriteItem[], { ordered: boolean }]>()
      .mockResolvedValue({ ok: 1 });
    const mockModel = { bulkWrite: mockBulkWrite } as unknown;

    const userId = new Types.ObjectId();
    await grantLevelBadges(
      userId,
      5,
      mockModel as Parameters<typeof grantLevelBadges>[2],
    );

    expect(mockBulkWrite).toHaveBeenCalledTimes(1);
    const [ops, options] = mockBulkWrite.mock.calls[0];
    expect(options).toEqual({ ordered: false });
    expect(ops.length).toBe(2);
    expect(ops[0].updateOne.filter.itemId).toBe('badge-newcomer');
    expect(ops[1].updateOne.filter.itemId).toBe('badge-scout');
    expect(ops[0].updateOne.upsert).toBe(true);
  });
});
