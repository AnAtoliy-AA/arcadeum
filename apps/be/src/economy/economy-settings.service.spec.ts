import { Test } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { EconomySettingsService } from './economy-settings.service';
import { EconomySetting } from './schemas/economy-setting.schema';
import { EconomySettingsAudit } from './schemas/economy-settings-audit.schema';
import { ECONOMY_KEYS } from './economy-keys';
import type { EconomyKey } from './economy-keys';
import { Types } from 'mongoose';

const oid = (): string => new Types.ObjectId().toString();
const adminId = oid();

describe('EconomySettingsService', () => {
  let service: EconomySettingsService;
  let settingModel: {
    findOne: jest.Mock;
    findOneAndUpdate: jest.Mock;
    deleteOne: jest.Mock;
    find: jest.Mock;
  };
  let auditModel: { create: jest.Mock; find: jest.Mock };
  let configService: { get: jest.Mock };
  let connection: { startSession: jest.Mock };
  let session: { withTransaction: jest.Mock; endSession: jest.Mock };

  beforeEach(async () => {
    settingModel = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn(),
    };
    auditModel = { create: jest.fn(), find: jest.fn() };
    configService = { get: jest.fn() };
    session = {
      withTransaction: jest.fn(async (cb: () => Promise<void>) => cb()),
      endSession: jest.fn(),
    };
    connection = { startSession: jest.fn().mockResolvedValue(session) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        EconomySettingsService,
        { provide: getConnectionToken(), useValue: connection },
        { provide: getModelToken(EconomySetting.name), useValue: settingModel },
        {
          provide: getModelToken(EconomySettingsAudit.name),
          useValue: auditModel,
        },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = moduleRef.get(EconomySettingsService);
  });

  describe('getNumber', () => {
    it('returns DB value when row exists', async () => {
      settingModel.findOne.mockReturnValueOnce({
        lean: () => Promise.resolve({ value: 77 }),
      });
      const v = await service.getNumber('game_win_coin_reward');
      expect(v).toBe(77);
    });

    it('returns env value when no DB row but env is set', async () => {
      settingModel.findOne.mockReturnValueOnce({
        lean: () => Promise.resolve(null),
      });
      configService.get.mockImplementation((k: string) =>
        k === 'GAME_WIN_COIN_REWARD' ? '88' : undefined,
      );
      const v = await service.getNumber('game_win_coin_reward');
      expect(v).toBe(88);
    });

    it('returns code default when neither DB nor env is set', async () => {
      settingModel.findOne.mockReturnValueOnce({
        lean: () => Promise.resolve(null),
      });
      configService.get.mockReturnValue(undefined);
      const v = await service.getNumber('game_win_coin_reward');
      expect(v).toBe(50); // ECONOMY_KEYS_CONFIG default
    });

    it('falls through to env when DB value is invalid (e.g. negative)', async () => {
      settingModel.findOne.mockReturnValueOnce({
        lean: () => Promise.resolve({ value: -5 }),
      });
      configService.get.mockReturnValue('99');
      const v = await service.getNumber('game_win_coin_reward');
      expect(v).toBe(99);
    });

    it('caches the resolved value (second call no DB hit)', async () => {
      settingModel.findOne.mockReturnValueOnce({
        lean: () => Promise.resolve({ value: 77 }),
      });
      await service.getNumber('game_win_coin_reward');
      await service.getNumber('game_win_coin_reward');
      expect(settingModel.findOne).toHaveBeenCalledTimes(1);
    });

    it('disables cache when TTL=0', async () => {
      configService.get.mockImplementation((k: string) => {
        if (k === 'ECONOMY_CACHE_TTL_SECONDS') return '0';
        return undefined;
      });
      // Re-create service with TTL=0
      const moduleRef = await Test.createTestingModule({
        providers: [
          EconomySettingsService,
          { provide: getConnectionToken(), useValue: connection },
          {
            provide: getModelToken(EconomySetting.name),
            useValue: settingModel,
          },
          {
            provide: getModelToken(EconomySettingsAudit.name),
            useValue: auditModel,
          },
          { provide: ConfigService, useValue: configService },
        ],
      }).compile();
      const noTtlService = moduleRef.get(EconomySettingsService);

      settingModel.findOne
        .mockReturnValueOnce({ lean: () => Promise.resolve({ value: 10 }) })
        .mockReturnValueOnce({ lean: () => Promise.resolve({ value: 20 }) });

      const first = await noTtlService.getNumber('game_win_coin_reward');
      const second = await noTtlService.getNumber('game_win_coin_reward');
      expect(first).toBe(10);
      expect(second).toBe(20);
      expect(settingModel.findOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('setNumber', () => {
    it('writes a setting + audit inside a transaction and invalidates the cache', async () => {
      // Prime the cache
      settingModel.findOne.mockReturnValueOnce({
        lean: () => Promise.resolve({ value: 50 }),
      });
      await service.getNumber('game_win_coin_reward');
      expect(settingModel.findOne).toHaveBeenCalledTimes(1);

      // setNumber reads fromValue inside the transaction
      settingModel.findOne.mockReturnValue({
        lean: () => Promise.resolve({ value: 50 }),
      });
      settingModel.findOneAndUpdate.mockResolvedValue({ value: 77 });
      auditModel.create.mockResolvedValue([{ _id: oid() }]);

      await service.setNumber('game_win_coin_reward', 77, adminId);

      expect(connection.startSession).toHaveBeenCalled();
      expect(session.withTransaction).toHaveBeenCalled();
      expect(settingModel.findOneAndUpdate).toHaveBeenCalled();
      expect(auditModel.create).toHaveBeenCalled();

      // Cache should be invalidated — next getNumber should hit DB again
      settingModel.findOne.mockReturnValueOnce({
        lean: () => Promise.resolve({ value: 77 }),
      });
      await service.getNumber('game_win_coin_reward');
      // Called once during setNumber transaction + once after cache clear
      expect(settingModel.findOne).toHaveBeenCalledTimes(3);
    });

    it('rejects invalid values (DTO catches most; service is defensive)', async () => {
      await expect(
        service.setNumber('game_win_coin_reward', 0, adminId),
      ).rejects.toThrow(/invalidValue/);
      await expect(
        service.setNumber('game_win_coin_reward', 1_000_001, adminId),
      ).rejects.toThrow(/invalidValue/);
    });

    it('rejects fractional values', async () => {
      await expect(
        service.setNumber('game_win_coin_reward', 1.5, adminId),
      ).rejects.toThrow(/invalidValue/);
    });

    it('rejects unknown keys', async () => {
      await expect(
        service.setNumber(
          'not_a_real_key' as unknown as EconomyKey,
          50,
          adminId,
        ),
      ).rejects.toThrow(/unknownKey/);
    });
  });

  describe('resetToDefault', () => {
    it('deletes the row + writes audit + invalidates cache', async () => {
      settingModel.findOne.mockReturnValue({
        lean: () => Promise.resolve({ value: 77 }),
      });
      settingModel.deleteOne.mockResolvedValue({ deletedCount: 1 });
      auditModel.create.mockResolvedValue([{ _id: oid() }]);
      configService.get.mockReturnValue(undefined);

      await service.resetToDefault('game_win_coin_reward', adminId);

      expect(session.withTransaction).toHaveBeenCalled();
      expect(settingModel.deleteOne).toHaveBeenCalled();
      expect(auditModel.create).toHaveBeenCalled();
    });

    it('writes audit even when no DB row exists (no-op but auditable)', async () => {
      settingModel.findOne.mockReturnValue({
        lean: () => Promise.resolve(null),
      });
      settingModel.deleteOne.mockResolvedValue({ deletedCount: 0 });
      auditModel.create.mockResolvedValue([{ _id: oid() }]);
      configService.get.mockReturnValue(undefined);

      await service.resetToDefault('game_win_coin_reward', adminId);

      expect(auditModel.create).toHaveBeenCalled();
      // fromValue and toValue should both be the code default (50)
      const createCall = auditModel.create.mock.calls[0] as [
        Array<{ fromValue: number; toValue: number }>,
        unknown,
      ];
      expect(createCall[0][0].fromValue).toBe(50);
      expect(createCall[0][0].toValue).toBe(50);
    });

    it('rejects unknown keys', async () => {
      await expect(
        service.resetToDefault(
          'not_a_real_key' as unknown as EconomyKey,
          adminId,
        ),
      ).rejects.toThrow(/unknownKey/);
    });
  });

  describe('listAll', () => {
    it('returns one view per registered key including those with no DB row', async () => {
      settingModel.find.mockReturnValueOnce({
        populate: () => ({
          lean: () =>
            Promise.resolve([
              {
                key: 'game_win_coin_reward',
                value: 77,
                updatedAt: new Date(),
                updatedBy: { _id: oid(), displayName: 'Alice' },
              },
            ]),
        }),
      });
      configService.get.mockImplementation((k: string) =>
        k === 'GEM_TO_COIN_RATE' ? '150' : undefined,
      );

      const all = await service.listAll();
      expect(all).toHaveLength(ECONOMY_KEYS.length);
      const game = all.find((v) => v.key === 'game_win_coin_reward')!;
      expect(game.currentValue).toBe(77);
      expect(game.source).toBe('override');
      expect(game.updatedByLabel).toBe('Alice');

      const gems = all.find((v) => v.key === 'gem_to_coin_rate')!;
      expect(gems.currentValue).toBe(150);
      expect(gems.source).toBe('env');

      const tier3 = all.find((v) => v.key === 'referral_tier_3_bonus_coins')!;
      expect(tier3.currentValue).toBe(500);
      expect(tier3.source).toBe('default');
    });
  });

  describe('getAuditFor', () => {
    it('returns recent rows for the key, sorted by changedAt desc', async () => {
      auditModel.find.mockReturnValueOnce({
        sort: () => ({
          limit: () => ({
            populate: () => ({
              lean: () =>
                Promise.resolve([
                  {
                    _id: oid(),
                    fromValue: 50,
                    toValue: 100,
                    adminUserId: { _id: oid(), displayName: 'Alice' },
                    createdAt: new Date('2026-05-09T00:00:00Z'),
                  },
                ]),
            }),
          }),
        }),
      });

      const rows = await service.getAuditFor('game_win_coin_reward');
      expect(rows).toHaveLength(1);
      expect(rows[0].fromValue).toBe(50);
      expect(rows[0].toValue).toBe(100);
      expect(rows[0].adminLabel).toBe('Alice');
    });

    it('rejects unknown keys', async () => {
      await expect(
        service.getAuditFor('bad_key' as unknown as EconomyKey),
      ).rejects.toThrow(/unknownKey/);
    });
  });

  describe('refreshCache', () => {
    it('clears the entire cache so next reads hit DB', async () => {
      settingModel.findOne
        .mockReturnValueOnce({ lean: () => Promise.resolve({ value: 10 }) })
        .mockReturnValueOnce({ lean: () => Promise.resolve({ value: 20 }) });

      await service.getNumber('game_win_coin_reward');
      service.refreshCache();
      await service.getNumber('game_win_coin_reward');

      expect(settingModel.findOne).toHaveBeenCalledTimes(2);
    });
  });
});
