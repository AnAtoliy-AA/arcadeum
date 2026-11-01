import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BulkRewardsService } from './bulk-rewards.service';
import { BulkRewardType } from './dto/bulk-reward.dto';
import { User } from '../auth/schemas/user.schema';
import { WalletService } from '../wallet/wallet.service';
import { InventoryService } from '../shop/services/inventory.service';

describe('BulkRewardsService', () => {
  let service: BulkRewardsService;
  let mockUserModel: {
    find: jest.Mock;
  };
  let mockWalletService: {
    credit: jest.Mock;
  };
  let mockInventoryService: {
    grant: jest.Mock;
  };

  beforeEach(async () => {
    mockUserModel = {
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest
            .fn()
            .mockResolvedValue([{ _id: 'user-1' }, { _id: 'user-2' }]),
        }),
      }),
    };

    mockWalletService = {
      credit: jest.fn().mockResolvedValue(undefined),
    };

    mockInventoryService = {
      grant: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkRewardsService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
      ],
    }).compile();

    service = module.get<BulkRewardsService>(BulkRewardsService);
  });

  it('grants pet species to all users when type is pet', async () => {
    const result = await service.rewardAllUsers(
      {
        type: BulkRewardType.PET,
        amount: 1,
        itemId: 'cyber_cat',
        reason: 'Community milestone celebration',
      },
      'admin-1',
    );

    expect(result.totalUsers).toBe(2);
    expect(result.successfulRewards).toBe(2);
    expect(mockInventoryService.grant).toHaveBeenCalledTimes(2);
    expect(mockInventoryService.grant).toHaveBeenCalledWith(
      'user-1',
      'pet:cyber_cat',
      expect.stringContaining('bulk-reward-pet-1-cyber_cat'),
    );
    expect(mockInventoryService.grant).toHaveBeenCalledWith(
      'user-2',
      'pet:cyber_cat',
      expect.stringContaining('bulk-reward-pet-1-cyber_cat'),
    );
  });

  it('defaults to dragon pet when itemId is not provided for pet type', async () => {
    const result = await service.rewardAllUsers(
      {
        type: BulkRewardType.PET,
        amount: 1,
      },
      'admin-1',
    );

    expect(result.successfulRewards).toBe(2);
    expect(mockInventoryService.grant).toHaveBeenCalledWith(
      'user-1',
      'pet:dragon',
      expect.stringContaining('bulk-reward-pet-1-none'),
    );
  });

  it('throws BadRequestException if item reward lacks itemId', async () => {
    await expect(
      service.rewardAllUsers(
        {
          type: BulkRewardType.ITEM,
          amount: 1,
        },
        'admin-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
