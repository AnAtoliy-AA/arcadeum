import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { NotificationsService } from './notifications.service';
import { Notification } from './schemas/notification.schema';
import { NotificationPreference } from './schemas/notification-preference.schema';
import { PushSubscription } from './schemas/push-subscription.schema';

type Lean = { lean: jest.Mock; exec?: jest.Mock };
type Exec<T = unknown> = { exec: jest.Mock<Promise<T>, []> };

function chain<T>(value: T): Lean & Exec<T> {
  const obj: Lean & Exec<T> = {
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  } as unknown as Lean & Exec<T>;
  return obj;
}

function listChain<T>(value: T[]): {
  sort: jest.Mock;
  limit: jest.Mock;
  lean: jest.Mock;
  exec: jest.Mock<Promise<T[]>, []>;
} {
  const obj = {
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  };
  return obj as unknown as typeof obj;
}

describe('NotificationsService', () => {
  const userId = '64a000000000000000000001';

  let service: NotificationsService;
  let notificationModel: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    countDocuments: jest.Mock;
    updateMany: jest.Mock;
  };
  let preferenceModel: {
    findOne: jest.Mock;
    find: jest.Mock;
    updateOne: jest.Mock;
  };
  let subscriptionModel: {
    find: jest.Mock;
    updateOne: jest.Mock;
    deleteOne: jest.Mock;
  };

  beforeEach(async () => {
    notificationModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      countDocuments: jest.fn(),
      updateMany: jest.fn(),
    };
    preferenceModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      updateOne: jest.fn(),
    };
    subscriptionModel = {
      find: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getModelToken(Notification.name),
          useValue: notificationModel,
        },
        {
          provide: getModelToken(NotificationPreference.name),
          useValue: preferenceModel,
        },
        {
          provide: getModelToken(PushSubscription.name),
          useValue: subscriptionModel,
        },
      ],
    }).compile();

    service = moduleRef.get(NotificationsService);
  });

  describe('preferences', () => {
    it('returns defaults all false when no doc exists', async () => {
      preferenceModel.findOne.mockReturnValue(chain(null));
      const prefs = await service.getPreferences(userId);
      expect(prefs).toEqual({
        daily_reward_ready: false,
        tournament_starting_soon: false,
        tournament_registration_opened: false,
        announcement_new: false,
      });
    });

    it('merges defaults with stored categories', async () => {
      preferenceModel.findOne.mockReturnValue(
        chain({
          userId: new Types.ObjectId(userId),
          categories: { daily_reward_ready: true },
        }),
      );
      const prefs = await service.getPreferences(userId);
      expect(prefs.daily_reward_ready).toBe(true);
      expect(prefs.announcement_new).toBe(false);
    });

    it('updatePreferences upserts merged categories', async () => {
      preferenceModel.findOne.mockReturnValue(
        chain({
          userId: new Types.ObjectId(userId),
          categories: { daily_reward_ready: true },
        }),
      );
      preferenceModel.updateOne.mockReturnValue(chain({ acknowledged: true }));

      const next = await service.updatePreferences(userId, {
        announcement_new: true,
      });

      expect(next.daily_reward_ready).toBe(true);
      expect(next.announcement_new).toBe(true);
      const [, update] = preferenceModel.updateOne.mock.calls[0] as [
        unknown,
        { $set: { categories: Record<string, boolean> } },
      ];
      expect(update.$set.categories).toEqual({
        daily_reward_ready: true,
        announcement_new: true,
        tournament_starting_soon: false,
        tournament_registration_opened: false,
      });
    });

    it('isCategoryEnabled is false when no doc', async () => {
      preferenceModel.findOne.mockReturnValue(chain(null));
      expect(await service.isCategoryEnabled(userId, 'announcement_new')).toBe(
        false,
      );
    });

    it('listUserIdsWithCategoryEnabled returns userIds from matching docs', async () => {
      const a = new Types.ObjectId();
      const b = new Types.ObjectId();
      preferenceModel.find.mockReturnValue(
        chain([{ userId: a }, { userId: b }]),
      );
      const ids =
        await service.listUserIdsWithCategoryEnabled('daily_reward_ready');
      expect(ids).toEqual([a, b]);
      expect(preferenceModel.find).toHaveBeenCalledWith(
        { 'categories.daily_reward_ready': true },
        { userId: 1 },
      );
    });
  });

  describe('subscriptions', () => {
    it('addSubscription upserts by endpoint', async () => {
      subscriptionModel.updateOne.mockReturnValue(chain(undefined));
      await service.addSubscription(userId, {
        endpoint: 'https://e/1',
        keys: { p256dh: 'p', auth: 'a' },
        userAgent: 'ua',
      });
      const [filter, update, opts] = subscriptionModel.updateOne.mock
        .calls[0] as [
        unknown,
        { $set: Record<string, unknown> },
        Record<string, unknown>,
      ];
      expect(filter).toEqual({ endpoint: 'https://e/1' });
      expect(opts).toEqual({ upsert: true });
      expect(update.$set).toMatchObject({
        endpoint: 'https://e/1',
        keys: { p256dh: 'p', auth: 'a' },
        userAgent: 'ua',
      });
    });

    it('removeSubscription scopes delete to userId + endpoint', async () => {
      subscriptionModel.deleteOne.mockReturnValue(chain(undefined));
      await service.removeSubscription(userId, 'https://e/1');
      expect(subscriptionModel.deleteOne).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
        endpoint: 'https://e/1',
      });
    });

    it('deleteSubscriptionByEndpoint is unconditional', async () => {
      subscriptionModel.deleteOne.mockReturnValue(chain(undefined));
      await service.deleteSubscriptionByEndpoint('https://e/1');
      expect(subscriptionModel.deleteOne).toHaveBeenCalledWith({
        endpoint: 'https://e/1',
      });
    });

    it('getSubscriptions returns endpoint + keys for user', async () => {
      subscriptionModel.find.mockReturnValue(
        chain([
          {
            endpoint: 'https://e/1',
            keys: { p256dh: 'p', auth: 'a' },
            userId: new Types.ObjectId(userId),
          },
        ]),
      );
      const subs = await service.getSubscriptions(userId);
      expect(subs).toEqual([
        { endpoint: 'https://e/1', keys: { p256dh: 'p', auth: 'a' } },
      ]);
    });
  });

  describe('inbox', () => {
    it('createInboxRow delegates to model.create with defaults', async () => {
      const created = { _id: new Types.ObjectId() };
      notificationModel.create.mockResolvedValue(created);
      const result = await service.createInboxRow({
        userId: new Types.ObjectId(userId),
        category: 'announcement_new',
        titleKey: 't',
        bodyKey: 'b',
        url: '/x',
      });
      expect(result).toBe(created);
      expect(notificationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'announcement_new',
          titleKey: 't',
          bodyKey: 'b',
          url: '/x',
          i18nParams: {},
          data: {},
          read: false,
        }),
      );
    });

    it('listInbox clamps limit and applies before cursor', async () => {
      const rows = [{ titleKey: 'a' }, { titleKey: 'b' }];
      notificationModel.find.mockReturnValue(listChain(rows));
      const before = new Date('2026-05-01T00:00:00Z');
      await service.listInbox(userId, { limit: 9999, before });
      expect(notificationModel.find).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
        createdAt: { $lt: before },
      });
    });

    it('unreadCount filters by userId + read=false', async () => {
      notificationModel.countDocuments.mockReturnValue(chain(7));
      const n = await service.unreadCount(userId);
      expect(n).toBe(7);
      expect(notificationModel.countDocuments).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
        read: false,
      });
    });

    it('markRead all sets read=true for all unread', async () => {
      notificationModel.updateMany.mockReturnValue(chain(undefined));
      await service.markRead(userId, { all: true });
      expect(notificationModel.updateMany).toHaveBeenCalledWith(
        { userId: new Types.ObjectId(userId), read: false },
        { $set: { read: true } },
      );
    });

    it('markRead ids scopes to userId + ids', async () => {
      notificationModel.updateMany.mockReturnValue(chain(undefined));
      const id1 = new Types.ObjectId().toHexString();
      const id2 = new Types.ObjectId().toHexString();
      await service.markRead(userId, { ids: [id1, id2] });
      expect(notificationModel.updateMany).toHaveBeenCalledWith(
        {
          userId: new Types.ObjectId(userId),
          _id: { $in: [new Types.ObjectId(id1), new Types.ObjectId(id2)] },
        },
        { $set: { read: true } },
      );
    });

    it('markRead with neither ids nor all is a no-op', async () => {
      await service.markRead(userId, {});
      expect(notificationModel.updateMany).not.toHaveBeenCalled();
    });
  });
});
