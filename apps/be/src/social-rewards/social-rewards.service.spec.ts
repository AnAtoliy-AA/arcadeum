import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { SocialRewardsService } from './social-rewards.service';
import { SocialRewardClaim } from './schemas/social-reward-claim.schema';
import { WalletService } from '../wallet/wallet.service';
import { EconomySettingsService } from '../economy/economy-settings.service';
import { SUPPORTED_SOCIAL_PLATFORMS } from './social-platforms';

describe('SocialRewardsService', () => {
  const userId = new Types.ObjectId().toHexString();

  let service: SocialRewardsService;
  let model: {
    find: jest.Mock;
    findOne: jest.Mock;
  };
  let walletService: { credit: jest.Mock; getBalance: jest.Mock };
  let economy: { getNumber: jest.Mock };

  beforeEach(async () => {
    model = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    walletService = {
      credit: jest.fn().mockResolvedValue({ balanceAfter: 5 }),
      getBalance: jest
        .fn()
        .mockResolvedValue({ coins: 100, gems: 5, arcadeum: 0 }),
    };

    economy = {
      getNumber: jest.fn().mockResolvedValue(1),
    };

    function MockModel(this: { save: () => Promise<unknown> }, data: unknown) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    }
    Object.assign(MockModel, model);

    const moduleRef = await Test.createTestingModule({
      providers: [
        SocialRewardsService,
        { provide: getModelToken(SocialRewardClaim.name), useValue: MockModel },
        { provide: WalletService, useValue: walletService },
        { provide: EconomySettingsService, useValue: economy },
      ],
    }).compile();

    service = moduleRef.get(SocialRewardsService);
  });

  describe('getStatus', () => {
    it('returns all platforms with claim status and configured gem quantity', async () => {
      const claimDate = new Date();
      model.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest
            .fn()
            .mockResolvedValue([{ platform: 'discord', claimedAt: claimDate }]),
        }),
      });

      const res = await service.getStatus(userId);

      expect(res.gemsPerSubscription).toBe(1);
      expect(res.totalAvailable).toBe(SUPPORTED_SOCIAL_PLATFORMS.length);
      expect(res.totalClaimed).toBe(1);

      const discordItem = res.items.find((item) => item.platform === 'discord');
      expect(discordItem).toBeDefined();
      expect(discordItem?.claimed).toBe(true);
      expect(discordItem?.claimedAt).toEqual(claimDate);
      expect(discordItem?.['gems']).toBe(1);

      const telegramItem = res.items.find(
        (item) => item.platform === 'telegram',
      );
      expect(telegramItem).toBeDefined();
      expect(telegramItem?.claimed).toBe(false);
      expect(telegramItem?.claimedAt).toBeNull();
      expect(telegramItem?.['gems']).toBe(1);
    });

    it('dynamically adapts when economy settings change', async () => {
      economy.getNumber.mockResolvedValue(3);
      model.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const res = await service.getStatus(userId);

      expect(res.gemsPerSubscription).toBe(3);
      expect(res.items.every((item) => item['gems'] === 3)).toBe(true);
    });
  });

  describe('claimReward', () => {
    it('successfully claims reward for valid platform and credits wallet', async () => {
      model.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const res = await service.claimReward(userId, 'telegram');

      expect(res.success).toBe(true);
      expect(res.platform).toBe('telegram');
      expect(res.gemsAwarded).toBe(1);
      expect(res.gemsBalanceAfter).toBe(5);
      expect(walletService.credit).toHaveBeenCalledWith(
        userId,
        'gems',
        1,
        'social_reward',
        `${userId}:social_reward:telegram`,
        { platform: 'telegram' },
      );
    });

    it('rejects unsupported platform with BadRequestException', async () => {
      await expect(
        service.claimReward(userId, 'unknown_platform'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects already claimed platform with ConflictException', async () => {
      model.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ platform: 'telegram' }),
        }),
      });

      await expect(service.claimReward(userId, 'telegram')).rejects.toThrow(
        ConflictException,
      );
    });

    it('handles duplicate key constraint error on concurrent claim', async () => {
      model.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      function ErrorModel(
        this: { save: () => Promise<unknown> },
        data: unknown,
      ) {
        Object.assign(this, data);
        this.save = jest.fn().mockRejectedValue({ code: 11000 });
      }
      Object.assign(ErrorModel, model);

      const moduleRef = await Test.createTestingModule({
        providers: [
          SocialRewardsService,
          {
            provide: getModelToken(SocialRewardClaim.name),
            useValue: ErrorModel,
          },
          { provide: WalletService, useValue: walletService },
          { provide: EconomySettingsService, useValue: economy },
        ],
      }).compile();

      const errorService = moduleRef.get(SocialRewardsService);
      await expect(
        errorService.claimReward(userId, 'telegram'),
      ).rejects.toThrow(ConflictException);
    });
  });
});
