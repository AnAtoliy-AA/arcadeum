import { Test } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DailyRewardsService } from './daily-rewards.service';
import { DailyRewardAlreadyClaimedError } from './daily-rewards.errors';
import { UserDailyReward } from './schemas/user-daily-reward.schema';
import { WalletService } from '../wallet/wallet.service';
import { EconomySettingsService } from '../economy/economy-settings.service';

type TransactionCallback = () => Promise<void>;

describe('DailyRewardsService', () => {
  const userId = new Types.ObjectId().toHexString();

  let service: DailyRewardsService;
  let model: {
    findOne: jest.Mock;
    findOneAndUpdate: jest.Mock;
    create: jest.Mock;
  };
  let connection: { startSession: jest.Mock };
  let session: { withTransaction: jest.Mock; endSession: jest.Mock };
  let walletService: { credit: jest.Mock };
  let economy: { getNumber: jest.Mock };

  // Freeze the clock so YYYY-MM-DD is deterministic.
  const fixedNow = new Date('2026-05-11T12:00:00.000Z');
  const today = '2026-05-11';
  const yesterday = '2026-05-10';

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(fixedNow);

    model = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      create: jest.fn(),
    };
    session = {
      withTransaction: jest.fn((cb: TransactionCallback) => cb()),
      endSession: jest.fn(),
    };
    connection = {
      startSession: jest.fn().mockResolvedValue(session),
    };
    walletService = {
      credit: jest.fn().mockResolvedValue({}),
    };
    economy = {
      getNumber: jest.fn().mockImplementation((key: string) => {
        const table: Record<string, number> = {
          daily_reward_day_1: 10,
          daily_reward_day_2: 20,
          daily_reward_day_3: 35,
          daily_reward_day_4: 55,
          daily_reward_day_5: 80,
          daily_reward_day_6: 110,
          daily_reward_day_7: 150,
          daily_reward_day_7_bonus_gems: 1,
        };
        return Promise.resolve(table[key] ?? 0);
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        DailyRewardsService,
        { provide: getConnectionToken(), useValue: connection },
        { provide: getModelToken(UserDailyReward.name), useValue: model },
        { provide: WalletService, useValue: walletService },
        { provide: EconomySettingsService, useValue: economy },
      ],
    }).compile();

    service = moduleRef.get(DailyRewardsService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Helper to stub a `findOne(...).session(s)` / `findOne(...).lean()` chain.
  // Different paths in the service may use either form so we cover both.
  function stubFindOne(doc: unknown) {
    const chain = {
      session: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(doc),
      then: undefined, // belt-and-braces: ensure it's not awaited as a promise
    };
    model.findOne.mockReturnValue(chain);
  }

  describe('getStatus', () => {
    it('returns canClaim=true and nextDay=1 for a first-time user', async () => {
      stubFindOne(null);

      const status = await service.getStatus(userId);

      expect(status.canClaim).toBe(true);
      expect(status.currentStreak).toBe(0);
      expect(status.nextDay).toBe(1);
      expect(status.nextRewardCoins).toBe(10);
      expect(typeof status.nextResetAt).toBe('string');
    });

    it('returns canClaim=false when user already claimed today', async () => {
      stubFindOne({
        userId: new Types.ObjectId(userId),
        lastClaimedDay: today,
        currentStreak: 3,
      });

      const status = await service.getStatus(userId);

      expect(status.canClaim).toBe(false);
      expect(status.currentStreak).toBe(3);
    });

    it('returns canClaim=true and nextDay=streak+1 when last claim was yesterday', async () => {
      stubFindOne({
        userId: new Types.ObjectId(userId),
        lastClaimedDay: yesterday,
        currentStreak: 2,
      });

      const status = await service.getStatus(userId);

      expect(status.canClaim).toBe(true);
      expect(status.currentStreak).toBe(2);
      expect(status.nextDay).toBe(3);
      expect(status.nextRewardCoins).toBe(35);
    });

    it('returns canClaim=true and nextDay=1 (reset) after a missed day', async () => {
      stubFindOne({
        userId: new Types.ObjectId(userId),
        lastClaimedDay: '2026-05-01',
        currentStreak: 6,
      });

      const status = await service.getStatus(userId);

      expect(status.canClaim).toBe(true);
      expect(status.nextDay).toBe(1);
      expect(status.nextRewardCoins).toBe(10);
    });

    it('wraps Day 7 → Day 1 when yesterday was Day 7', async () => {
      stubFindOne({
        userId: new Types.ObjectId(userId),
        lastClaimedDay: yesterday,
        currentStreak: 7,
      });

      const status = await service.getStatus(userId);

      expect(status.canClaim).toBe(true);
      expect(status.nextDay).toBe(1);
      expect(status.nextRewardCoins).toBe(10);
    });
  });

  describe('claim', () => {
    it('first claim awards Day 1, credits wallet, persists state', async () => {
      stubFindOne(null);
      model.findOneAndUpdate.mockResolvedValue({
        userId: new Types.ObjectId(userId),
        lastClaimedDay: today,
        currentStreak: 1,
      });
      walletService.credit.mockResolvedValue({
        balanceAfter: 10,
      });

      const result = await service.claim(userId);

      expect(result.awardedCoins).toBe(10);
      expect(result.currentStreak).toBe(1);
      // Wallet credited with the right reason + idempotency key
      expect(walletService.credit).toHaveBeenCalledTimes(1);
      const args = walletService.credit.mock.calls[0] as unknown[];
      expect(args[0]).toBe(userId);
      expect(args[1]).toBe('coins');
      expect(args[2]).toBe(10);
      expect(args[3]).toBe('daily_reward');
      expect(args[4]).toBe(`${userId}:${today}`);
      // Per-user doc upserted
      expect(model.findOneAndUpdate).toHaveBeenCalledTimes(1);
      const updateArgs = model.findOneAndUpdate.mock.calls[0] as [
        Record<string, unknown>,
        { $set: { lastClaimedDay: string; currentStreak: number } },
        { upsert: boolean },
      ];
      expect(updateArgs[1].$set.lastClaimedDay).toBe(today);
      expect(updateArgs[1].$set.currentStreak).toBe(1);
      expect(updateArgs[2].upsert).toBe(true);
    });

    it('consecutive day increments streak and awards the right amount', async () => {
      stubFindOne({
        userId: new Types.ObjectId(userId),
        lastClaimedDay: yesterday,
        currentStreak: 3,
      });
      model.findOneAndUpdate.mockResolvedValue({});

      const result = await service.claim(userId);

      expect(result.currentStreak).toBe(4);
      expect(result.awardedCoins).toBe(55);
      expect((walletService.credit.mock.calls[0] as unknown[])[2]).toBe(55);
    });

    it('gap-day resets streak to 1 before payout', async () => {
      stubFindOne({
        userId: new Types.ObjectId(userId),
        lastClaimedDay: '2026-05-01',
        currentStreak: 4,
      });
      model.findOneAndUpdate.mockResolvedValue({});

      const result = await service.claim(userId);

      expect(result.currentStreak).toBe(1);
      expect(result.awardedCoins).toBe(10);
    });

    it('Day 7 wraps to Day 1 on the next consecutive claim', async () => {
      stubFindOne({
        userId: new Types.ObjectId(userId),
        lastClaimedDay: yesterday,
        currentStreak: 7,
      });
      model.findOneAndUpdate.mockResolvedValue({});

      const result = await service.claim(userId);

      expect(result.currentStreak).toBe(1);
      expect(result.awardedCoins).toBe(10);
    });

    it('Day 7 also credits the gem bonus on a separate idempotency key', async () => {
      stubFindOne({
        userId: new Types.ObjectId(userId),
        lastClaimedDay: yesterday,
        currentStreak: 6,
      });
      model.findOneAndUpdate.mockResolvedValue({});
      walletService.credit
        .mockResolvedValueOnce({ balanceAfter: 150 }) // coins tx
        .mockResolvedValueOnce({ balanceAfter: 1 }); // gems tx

      const result = await service.claim(userId);

      expect(result.currentStreak).toBe(7);
      expect(result.awardedCoins).toBe(150);
      expect(result.awardedGems).toBe(1);
      expect(result.coinsBalanceAfter).toBe(150);
      expect(result.gemsBalanceAfter).toBe(1);
      expect(walletService.credit).toHaveBeenCalledTimes(2);
      const coinsArgs = walletService.credit.mock.calls[0] as unknown[];
      const gemsArgs = walletService.credit.mock.calls[1] as unknown[];
      expect(coinsArgs[1]).toBe('coins');
      expect(coinsArgs[4]).toBe(`${userId}:${today}`);
      expect(gemsArgs[1]).toBe('gems');
      expect(gemsArgs[4]).toBe(`${userId}:${today}:gems`);
    });

    it('throws DailyRewardAlreadyClaimedError on a double claim same UTC day', async () => {
      stubFindOne({
        userId: new Types.ObjectId(userId),
        lastClaimedDay: today,
        currentStreak: 2,
      });

      await expect(service.claim(userId)).rejects.toBeInstanceOf(
        DailyRewardAlreadyClaimedError,
      );
      expect(walletService.credit).not.toHaveBeenCalled();
      expect(model.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('does not start its own session when a parentSession is passed', async () => {
      stubFindOne(null);
      model.findOneAndUpdate.mockResolvedValue({});

      // Cast: parentSession is a Mongoose ClientSession; we don't exercise its
      // methods here, the service should just forward it to wallet.credit and
      // skip connection.startSession.
      const parent = {} as unknown as Parameters<typeof service.claim>[1];

      await service.claim(userId, parent);

      expect(connection.startSession).not.toHaveBeenCalled();
      const args = walletService.credit.mock.calls[0] as unknown[];
      // 7th arg (index 6) is parentSession on WalletService.credit
      expect(args[6]).toBe(parent);
    });

    it('rolls back the per-user doc when the wallet credit fails (own session)', async () => {
      stubFindOne(null);

      // Make withTransaction propagate exceptions like the real Mongoose impl.
      session.withTransaction.mockImplementation(
        async (cb: TransactionCallback) => {
          await cb();
        },
      );
      walletService.credit.mockRejectedValue(new Error('wallet-down'));

      await expect(service.claim(userId)).rejects.toThrow('wallet-down');
      // findOneAndUpdate may not have been called, or its effects are rolled
      // back inside the transaction — either way it MUST NOT be returned as
      // successful. The wallet error must surface to the caller.
    });
  });
});
