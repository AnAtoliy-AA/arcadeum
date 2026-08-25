import { Types } from 'mongoose';
import { DailyRewardsNotificationCron } from './daily-rewards.notification.cron';
import type { NotificationDispatcher } from '../notifications/notifications.dispatcher';
import type { NotificationsService } from '../notifications/notifications.service';

const ONE_HOUR_MS = 60 * 60 * 1000;

function buildCron(overrides: {
  optedIn: Types.ObjectId[];
  matchingDocs: Array<{ userId: Types.ObjectId; updatedAt: Date }>;
}) {
  const findExec = jest.fn().mockResolvedValue(overrides.matchingDocs);
  const modelFind = jest.fn().mockReturnValue({
    lean: jest.fn().mockReturnValue({ exec: findExec }),
  });
  const model = { find: modelFind } as unknown as ConstructorParameters<
    typeof DailyRewardsNotificationCron
  >[0];

  const dispatcher = {
    dispatch: jest.fn().mockResolvedValue(undefined),
    dispatchMany: jest.fn().mockResolvedValue(undefined),
  } as unknown as NotificationDispatcher;
  const notifications = {
    listUserIdsWithCategoryEnabled: jest
      .fn()
      .mockResolvedValue(overrides.optedIn),
  } as unknown as NotificationsService;

  const cron = new DailyRewardsNotificationCron(
    model,
    dispatcher,
    notifications,
  );
  return { cron, dispatcher, notifications, modelFind };
}

describe('DailyRewardsNotificationCron', () => {
  it('skips work when no users are opted in', async () => {
    const { cron, modelFind } = buildCron({ optedIn: [], matchingDocs: [] });
    await cron.run();
    expect(modelFind).not.toHaveBeenCalled();
  });

  it('dispatches one notification per due user', async () => {
    const a = new Types.ObjectId();
    const b = new Types.ObjectId();
    const { cron, dispatcher } = buildCron({
      optedIn: [a, b],
      matchingDocs: [
        { userId: a, updatedAt: new Date(Date.now() - 24 * ONE_HOUR_MS) },
        { userId: b, updatedAt: new Date(Date.now() - 24 * ONE_HOUR_MS) },
      ],
    });
    const sent = await cron.notifyDueUsers([a, b]);
    expect(sent).toBe(2);
    // One batched fan-out instead of a serial dispatch per user; the cron
    // already filtered opted-in users, so the pref re-check is skipped.
    expect(dispatcher.dispatchMany).toHaveBeenCalledTimes(1);
    expect(dispatcher.dispatchMany).toHaveBeenCalledWith(
      [a.toHexString(), b.toHexString()],
      expect.objectContaining({
        category: 'daily_reward_ready',
        titleKey: 'notifications.daily_reward_ready.title',
        bodyKey: 'notifications.daily_reward_ready.body',
        url: '/daily-rewards',
        skipCategoryCheck: true,
      }),
    );
  });

  it('queries between 23 and 25 hours ago and only for opted-in users', async () => {
    const a = new Types.ObjectId();
    const { cron, modelFind } = buildCron({
      optedIn: [a],
      matchingDocs: [],
    });
    await cron.notifyDueUsers([a]);
    const calls = modelFind.mock.calls as unknown as Array<
      [
        {
          userId: { $in: Types.ObjectId[] };
          updatedAt: { $gte: Date; $lte: Date };
        },
      ]
    >;
    const filter = calls[0][0];
    expect(filter.userId.$in).toEqual([a]);
    const window =
      filter.updatedAt.$lte.getTime() - filter.updatedAt.$gte.getTime();
    expect(window).toBe(2 * ONE_HOUR_MS);
  });

  it('does NOT throw when the dispatcher fails for one user (run wrapper)', async () => {
    const a = new Types.ObjectId();
    const { cron, dispatcher } = buildCron({
      optedIn: [a],
      matchingDocs: [
        { userId: a, updatedAt: new Date(Date.now() - 24 * ONE_HOUR_MS) },
      ],
    });
    (dispatcher.dispatchMany as jest.Mock).mockRejectedValue(new Error('boom'));
    await expect(cron.run()).resolves.toBeUndefined();
  });
});
