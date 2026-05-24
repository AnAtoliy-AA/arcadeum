import { Types } from 'mongoose';
import { NotificationDispatcher } from './notifications.dispatcher';
import type { NotificationsService } from './notifications.service';
import type { NotificationsGateway } from './notifications.gateway';
import type { PushSender } from './push-sender';

function buildDispatcher(overrides: {
  isCategoryEnabled: boolean;
  pushEnabled?: boolean;
  subs?: Array<{ endpoint: string; keys: { p256dh: string; auth: string } }>;
  sendAllResult?: number;
  pushThrows?: boolean;
}): {
  dispatcher: NotificationDispatcher;
  service: jest.Mocked<NotificationsService>;
  gateway: jest.Mocked<NotificationsGateway>;
  pushSender: jest.Mocked<PushSender>;
} {
  const rowId = new Types.ObjectId();
  const service = {
    isCategoryEnabled: jest.fn().mockResolvedValue(overrides.isCategoryEnabled),
    createInboxRow: jest.fn().mockResolvedValue({ _id: rowId }),
    getSubscriptions: jest.fn().mockResolvedValue(overrides.subs ?? []),
    deleteSubscriptionByEndpoint: jest.fn().mockResolvedValue(undefined),
    unreadCount: jest.fn().mockResolvedValue(1),
  } as unknown as jest.Mocked<NotificationsService>;

  const gateway = {
    emitNew: jest.fn(),
    emitUnreadCount: jest.fn(),
  } as unknown as jest.Mocked<NotificationsGateway>;

  const pushSender = {
    isEnabled: jest.fn().mockReturnValue(overrides.pushEnabled ?? true),
    sendAll: overrides.pushThrows
      ? jest.fn().mockRejectedValue(new Error('boom'))
      : jest.fn().mockResolvedValue(overrides.sendAllResult ?? 1),
  } as unknown as jest.Mocked<PushSender>;

  const dispatcher = new NotificationDispatcher(service, gateway, pushSender);
  return { dispatcher, service, gateway, pushSender };
}

const baseParams = {
  userId: new Types.ObjectId().toHexString(),
  category: 'daily_reward_ready' as const,
  titleKey: 'notifications.daily_reward_ready.title',
  bodyKey: 'notifications.daily_reward_ready.body',
  url: '/daily-rewards',
};

describe('NotificationDispatcher', () => {
  it('short-circuits when category disabled (no inbox write, no emits)', async () => {
    const { dispatcher, service, gateway, pushSender } = buildDispatcher({
      isCategoryEnabled: false,
    });
    await dispatcher.dispatch(baseParams);
    expect(service.createInboxRow).not.toHaveBeenCalled();
    expect(gateway.emitNew).not.toHaveBeenCalled();
    expect(pushSender.sendAll).not.toHaveBeenCalled();
  });

  it('writes inbox, emits socket + count, sends push when enabled', async () => {
    const { dispatcher, service, gateway, pushSender } = buildDispatcher({
      isCategoryEnabled: true,
      subs: [{ endpoint: 'https://e/1', keys: { p256dh: 'p', auth: 'a' } }],
    });
    await dispatcher.dispatch(baseParams);
    expect(service.createInboxRow).toHaveBeenCalled();
    expect(gateway.emitNew).toHaveBeenCalledWith(
      baseParams.userId,
      expect.objectContaining({
        category: 'daily_reward_ready',
        titleKey: baseParams.titleKey,
        url: '/daily-rewards',
      }) as unknown,
    );
    expect(gateway.emitUnreadCount).toHaveBeenCalledWith(baseParams.userId, 1);
    expect(pushSender.sendAll).toHaveBeenCalled();
  });

  it('skips push call when push-sender disabled', async () => {
    const { dispatcher, pushSender } = buildDispatcher({
      isCategoryEnabled: true,
      pushEnabled: false,
      subs: [{ endpoint: 'https://e/1', keys: { p256dh: 'p', auth: 'a' } }],
    });
    await dispatcher.dispatch(baseParams);
    expect(pushSender.sendAll).not.toHaveBeenCalled();
  });

  it('skips push call when user has no subscriptions', async () => {
    const { dispatcher, pushSender } = buildDispatcher({
      isCategoryEnabled: true,
      subs: [],
    });
    await dispatcher.dispatch(baseParams);
    expect(pushSender.sendAll).not.toHaveBeenCalled();
  });

  it('never throws when push-sender throws', async () => {
    const { dispatcher, gateway } = buildDispatcher({
      isCategoryEnabled: true,
      subs: [{ endpoint: 'https://e/1', keys: { p256dh: 'p', auth: 'a' } }],
      pushThrows: true,
    });
    await expect(dispatcher.dispatch(baseParams)).resolves.toBeUndefined();
    // Inbox + socket happened before push tried, so emitNew was called.
    expect(gateway.emitNew).toHaveBeenCalled();
  });

  it('renders title/body server-side using locale (defaults to en)', async () => {
    const { dispatcher, pushSender } = buildDispatcher({
      isCategoryEnabled: true,
      subs: [{ endpoint: 'https://e/1', keys: { p256dh: 'p', auth: 'a' } }],
    });
    await dispatcher.dispatch({
      ...baseParams,
      category: 'tournament_starting_soon',
      titleKey: 'notifications.tournament_starting_soon.title',
      bodyKey: 'notifications.tournament_starting_soon.body',
      i18nParams: { name: 'Cup', minutes: 10 },
    });
    const [, payload] = pushSender.sendAll.mock.calls[0] as [
      unknown,
      { title: string; body: string },
      unknown,
    ];
    expect(payload.title).toBe('Cup starts in 10 min');
  });

  it('uses ru locale when provided', async () => {
    const { dispatcher, pushSender } = buildDispatcher({
      isCategoryEnabled: true,
      subs: [{ endpoint: 'https://e/1', keys: { p256dh: 'p', auth: 'a' } }],
    });
    await dispatcher.dispatch({
      ...baseParams,
      locale: 'ru',
    });
    const [, payload] = pushSender.sendAll.mock.calls[0] as [
      unknown,
      { title: string; body: string },
      unknown,
    ];
    expect(payload.title).toBe('Награда дня готова');
  });

  it('dispatchMany calls dispatch for each userId', async () => {
    const { dispatcher, service } = buildDispatcher({
      isCategoryEnabled: true,
    });
    const ids = [
      new Types.ObjectId().toHexString(),
      new Types.ObjectId().toHexString(),
    ];
    await dispatcher.dispatchMany(ids, {
      category: baseParams.category,
      titleKey: baseParams.titleKey,
      bodyKey: baseParams.bodyKey,
      url: baseParams.url,
    });
    expect(service.createInboxRow).toHaveBeenCalledTimes(2);
  });
});
