import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BulkRewardsService } from './bulk-rewards.service';
import { BulkRewardType } from './dto/bulk-reward.dto';
import { User } from '../auth/schemas/user.schema';
import { WalletService } from '../wallet/wallet.service';
import { InventoryService } from '../shop/services/inventory.service';
import { ArcadePetCollectionService } from '../arcade-pet/arcade-pet-collection.service';

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
  let mockPetCollections: {
    grantPresent: jest.Mock;
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

    mockPetCollections = {
      grantPresent: jest.fn().mockResolvedValue(true),
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
        {
          provide: ArcadePetCollectionService,
          useValue: mockPetCollections,
        },
      ],
    }).compile();

    service = module.get<BulkRewardsService>(BulkRewardsService);
  });

  it('does not touch shop inventory for pet rewards', async () => {
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
    expect(mockInventoryService.grant).not.toHaveBeenCalled();
  });

  it('delivers a claimable present into each user pet collection', async () => {
    await service.rewardAllUsers(
      { type: BulkRewardType.PET, amount: 1, itemId: 'cyber_cat' },
      'admin-1',
    );
    expect(mockPetCollections.grantPresent).toHaveBeenCalledTimes(2);
    expect(mockPetCollections.grantPresent).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        species: 'cyber_cat',
        petName: 'Cyber Cat',
        isOpened: false,
        id: expect.stringMatching(/^admin-gift-[0-9a-f]{16}$/) as string,
      }),
    );
  });

  it('rejects an unknown species before rewarding anyone', async () => {
    await expect(
      service.rewardAllUsers(
        { type: BulkRewardType.PET, amount: 1, itemId: 'unicorn' },
        'admin-1',
      ),
    ).rejects.toThrow(BadRequestException);
    expect(mockPetCollections.grantPresent).not.toHaveBeenCalled();
  });

  it('defaults to a dragon present when itemId is not provided', async () => {
    const result = await service.rewardAllUsers(
      { type: BulkRewardType.PET, amount: 1 },
      'admin-1',
    );

    expect(result.successfulRewards).toBe(2);
    expect(mockPetCollections.grantPresent).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ species: 'dragon' }),
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
