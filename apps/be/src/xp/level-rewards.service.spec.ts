import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LevelRewardsService } from './level-rewards.service';
import { User } from '../auth/schemas/user.schema';
import { WalletService } from '../wallet/wallet.service';
import { UserInventoryItem } from '../shop/schemas/user-inventory-item.schema';
import { xpForLevel } from './lib/xp-level';

describe('LevelRewardsService', () => {
  let service: LevelRewardsService;

  const mockSave = jest.fn();
  const mockUserDoc = {
    _id: 'user-123',
    xp: xpForLevel(5),
    claimedLevel: 0,
    save: mockSave,
  };

  const mockUserModel = {
    findById: jest.fn(),
  };

  const mockWalletService = {
    credit: jest.fn().mockResolvedValue({}),
  };

  const mockInventoryModel = {
    bulkWrite: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockSave.mockResolvedValue(mockUserDoc);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LevelRewardsService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
        {
          provide: getModelToken(UserInventoryItem.name),
          useValue: mockInventoryModel,
        },
      ],
    }).compile();

    service = module.get<LevelRewardsService>(LevelRewardsService);
  });

  describe('getStatus', () => {
    it('returns pending coins and badges for unclaimed levels', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({
            xp: xpForLevel(5),
            claimedLevel: 1,
          }),
        }),
      });

      const status = await service.getStatus('user-123');
      expect(status.currentLevel).toBe(5);
      expect(status.claimedLevel).toBe(1);
      expect(status.unclaimedLevels).toEqual([2, 3, 4, 5]);
      expect(status.pendingCoins).toBe(2 * 50 + 3 * 50 + 4 * 50 + 5 * 50);
      expect(status.pendingBadges).toEqual(['badge-scout']);
    });

    it('returns empty when all levels are already claimed', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({
            xp: xpForLevel(5),
            claimedLevel: 5,
          }),
        }),
      });

      const status = await service.getStatus('user-123');
      expect(status.unclaimedLevels).toHaveLength(0);
      expect(status.pendingCoins).toBe(0);
      expect(status.pendingBadges).toHaveLength(0);
    });
  });

  describe('claim', () => {
    it('credits coins and marks level as claimed', async () => {
      const user = {
        _id: 'user-123',
        xp: xpForLevel(5),
        claimedLevel: 0,
        save: mockSave,
      };
      mockUserModel.findById.mockResolvedValue(user);

      const result = await service.claim('user-123');

      const expectedCoins = 1 * 50 + 2 * 50 + 3 * 50 + 4 * 50 + 5 * 50;
      expect(result.coinsAwarded).toBe(expectedCoins);
      expect(result.claimedLevel).toBe(5);
      expect(result.badgesAwarded).toContain('badge-newcomer');
      expect(result.badgesAwarded).toContain('badge-scout');
      expect(result.alreadyClaimed).toBe(false);

      expect(mockWalletService.credit).toHaveBeenCalledWith(
        'user-123',
        'coins',
        expectedCoins,
        'level_reward',
        expect.stringContaining('level-reward-user-123-0-5'),
        { fromLevel: 1, toLevel: 5 },
      );
      expect(mockInventoryModel.bulkWrite).toHaveBeenCalled();
      expect(user.claimedLevel).toBe(5);
      expect(mockSave).toHaveBeenCalled();
    });

    it('returns alreadyClaimed if claimedLevel matches currentLevel', async () => {
      const user = {
        _id: 'user-123',
        xp: xpForLevel(5),
        claimedLevel: 5,
        save: mockSave,
      };
      mockUserModel.findById.mockResolvedValue(user);

      const result = await service.claim('user-123');
      expect(result.alreadyClaimed).toBe(true);
      expect(result.coinsAwarded).toBe(0);
      expect(mockWalletService.credit).not.toHaveBeenCalled();
    });
  });
});
