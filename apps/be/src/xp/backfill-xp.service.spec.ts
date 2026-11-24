import { BackfillXpService } from './backfill-xp.service';
import { createRealXpSettings } from './xp-test-fakes';

describe('BackfillXpService', () => {
  const build = (
    stats: Array<{
      _id: { userId: string; gameId: string };
      totalWins: number;
      totalLosses: number;
      totalDraws: number;
    }>,
    existingXp: number,
    settingsDocs = {},
  ) => {
    const findOneAndUpdate = jest.fn().mockResolvedValue(null);
    const userModel = {
      findById: () => ({
        select: () => ({
          lean: () => Promise.resolve({ xp: existingXp }),
        }),
      }),
      findOneAndUpdate,
    };
    const playerStatsModel = {
      aggregate: () => ({ exec: () => Promise.resolve(stats) }),
    };
    const svc = new BackfillXpService(
      userModel as never,
      playerStatsModel as never,
      { bulkWrite: jest.fn().mockResolvedValue(undefined) } as never,
      createRealXpSettings({}, settingsDocs),
    );
    return { svc, findOneAndUpdate };
  };

  const stat = (gameId: string) => ({
    _id: { userId: 'u1', gameId },
    totalWins: 2,
    totalLosses: 1,
    totalDraws: 0,
  });

  it('uses $inc with the delta (preserves concurrent awards), not $set', async () => {
    const { svc, findOneAndUpdate } = build([stat('chess_v1')], 100);
    const res = await svc.backfill(false);
    // 2*100 + 1*40 = 240, existing 100 -> +140
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'u1' },
      { $inc: { xp: 140 } },
    );
    expect(res.affected).toBe(1);
  });

  it('honours admin XP settings per game', async () => {
    const { svc, findOneAndUpdate } = build([stat('chess_v1')], 0, {
      global: { winXp: 10, lossXp: 0 },
    });
    await svc.backfill(false);
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'u1' },
      { $inc: { xp: 20 } },
    );
  });

  it('sums across games and does nothing on dry run', async () => {
    const { svc, findOneAndUpdate } = build(
      [stat('chess_v1'), stat('hearts')],
      0,
    );
    const res = await svc.backfill(true);
    expect(findOneAndUpdate).not.toHaveBeenCalled();
    expect(res.details[0].calculatedXp).toBe(480);
  });

  it('skips users who already have at least the computed XP', async () => {
    const { svc, findOneAndUpdate } = build([stat('chess_v1')], 5000);
    const res = await svc.backfill(false);
    expect(findOneAndUpdate).not.toHaveBeenCalled();
    expect(res.skipped).toBe(1);
  });
});
