import { Test } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { GiftService } from './gift.service';
import { User } from '../../auth/schemas/user.schema';
import { UserInventoryItem } from '../schemas/user-inventory-item.schema';
import { ShopAdminAudit } from '../schemas/shop-admin-audit.schema';
import { InventoryService } from './inventory.service';
import { FriendsService } from '../../friends/friends.service';
import { NotificationDispatcher } from '../../notifications/notifications.dispatcher';

describe('GiftService', () => {
  const senderId = '64a000000000000000000001';
  const recipientId = '64a000000000000000000002';
  const itemId = 'avatar-fox-01';

  let service: GiftService;
  let userModel: {
    findById: jest.Mock;
  };
  let inventoryModel: {
    findOne: jest.Mock;
    updateOne: jest.Mock;
    create: jest.Mock;
  };
  let auditModel: {
    create: jest.Mock;
  };
  let inventoryService: {
    clearEquipIfPointsAt: jest.Mock;
  };
  let friendsService: {
    getFriendIds: jest.Mock;
  };
  let dispatcher: {
    dispatch: jest.Mock;
  };

  beforeEach(async () => {
    userModel = {
      findById: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          username: 'alice',
          displayName: 'Alice',
        }),
      }),
    };

    inventoryModel = {
      findOne: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId('64a000000000000000000099'),
          userId: new Types.ObjectId(senderId),
          itemId,
          purchaseId: 'p1',
          acquiredVia: 'coins',
        }),
      }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      create: jest.fn().mockResolvedValue([
        {
          _id: new Types.ObjectId('64a000000000000000000100'),
          userId: new Types.ObjectId(recipientId),
          itemId,
          purchaseId: 'gift-p2',
          acquiredVia: 'gift',
          paidAmount: null,
          paidCurrency: null,
          soldAt: null,
          createdAt: new Date(),
        },
      ]),
    };

    auditModel = {
      create: jest.fn().mockResolvedValue([]),
    };

    inventoryService = {
      clearEquipIfPointsAt: jest.fn().mockResolvedValue(undefined),
    };

    friendsService = {
      getFriendIds: jest.fn().mockResolvedValue([recipientId]),
    };

    dispatcher = {
      dispatch: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      providers: [
        GiftService,
        { provide: getConnectionToken(), useValue: {} },
        { provide: getModelToken(User.name), useValue: userModel },
        {
          provide: getModelToken(UserInventoryItem.name),
          useValue: inventoryModel,
        },
        { provide: getModelToken(ShopAdminAudit.name), useValue: auditModel },
        { provide: InventoryService, useValue: inventoryService },
        { provide: FriendsService, useValue: friendsService },
        { provide: NotificationDispatcher, useValue: dispatcher },
      ],
    }).compile();

    service = module.get<GiftService>(GiftService);
  });

  it('rejects gifting self', async () => {
    await expect(
      service.gift(senderId, senderId, itemId, 'hello'),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects non-friends', async () => {
    friendsService.getFriendIds.mockResolvedValue([]);
    await expect(
      service.gift(senderId, recipientId, itemId, 'hello'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('dispatches gift_received notification to recipient on success', async () => {
    const result = await service.gift(
      senderId,
      recipientId,
      itemId,
      'Happy birthday!',
    );

    expect(result.inventoryItem.itemId).toBe(itemId);
    expect(result.inventoryItem.acquiredVia).toBe('gift');
    expect(dispatcher.dispatch).toHaveBeenCalledWith({
      userId: recipientId,
      category: 'gift_received',
      titleKey: 'notifications.gift_received.title',
      bodyKey: 'notifications.gift_received.body',
      i18nParams: {
        senderName: 'Alice',
        itemName: itemId,
        nameKey: 'items.avatar.fox01.name',
        message: 'Happy birthday!',
      },
      url: '/shop/inventory',
      data: {
        itemId,
        nameKey: 'items.avatar.fox01.name',
        senderId,
        senderName: 'Alice',
        message: 'Happy birthday!',
      },
      skipCategoryCheck: true,
    });
  });
});
