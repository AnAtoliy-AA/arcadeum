import { Types } from 'mongoose';
import { TournamentsNotificationCron } from './tournaments.notification.cron';
import type { NotificationDispatcher } from '../notifications/notifications.dispatcher';
import type { NotificationsService } from '../notifications/notifications.service';

const MINUTE_MS = 60 * 1000;

function buildCron(overrides: {
  matchingDocs: Array<Record<string, unknown>>;
  optedIn?: Types.ObjectId[];
}) {
  const findExec = jest.fn().mockResolvedValue(overrides.matchingDocs);
  const updateExec = jest.fn().mockResolvedValue(undefined);
  const modelFind = jest.fn().mockReturnValue({
    lean: jest.fn().mockReturnValue({ exec: findExec }),
  });
  const modelUpdateOne = jest.fn().mockReturnValue({ exec: updateExec });
  const model = {
    find: modelFind,
    updateOne: modelUpdateOne,
  } as unknown as ConstructorParameters<typeof TournamentsNotificationCron>[0];

  const dispatcher = {
    dispatch: jest.fn().mockResolvedValue(undefined),
    dispatchMany: jest.fn().mockResolvedValue(undefined),
  } as unknown as NotificationDispatcher;
  const notifications = {
    listUserIdsWithCategoryEnabled: jest
      .fn()
      .mockResolvedValue(overrides.optedIn ?? []),
  } as unknown as NotificationsService;

  const cron = new TournamentsNotificationCron(
    model,
    dispatcher,
    notifications,
  );
  return {
    cron,
    dispatcher,
    notifications,
    modelFind,
    modelUpdateOne,
  };
}

describe('TournamentsNotificationCron — starting soon', () => {
  it('dispatches to all registrations and stamps the tournament', async () => {
    const tournamentId = new Types.ObjectId();
    const userA = new Types.ObjectId();
    const userB = new Types.ObjectId();
    const { cron, dispatcher, modelUpdateOne } = buildCron({
      matchingDocs: [
        {
          _id: tournamentId,
          status: 'registration_open',
          scheduledAt: new Date(Date.now() + 12 * MINUTE_MS),
          notifiedStartingSoonAt: null,
          content: { en: { name: 'Spring Cup' } },
          registrations: [{ userId: userA }, { userId: userB }],
        },
      ],
    });
    await cron.runStartingSoon();
    expect(dispatcher.dispatch).toHaveBeenCalledTimes(2);
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'tournament_starting_soon',
        i18nParams: expect.objectContaining({ name: 'Spring Cup' }) as unknown,
      }),
    );
    expect(modelUpdateOne).toHaveBeenCalledWith(
      { _id: tournamentId },
      { $set: { notifiedStartingSoonAt: expect.any(Date) as unknown } },
    );
  });

  it('skips re-dispatch when notifiedStartingSoonAt is set (query filter)', async () => {
    const { cron, modelFind } = buildCron({ matchingDocs: [] });
    await cron.runStartingSoon();
    const calls = modelFind.mock.calls as unknown as Array<
      [Record<string, unknown>]
    >;
    const filter = calls[0]?.[0] ?? {};
    expect(filter.notifiedStartingSoonAt).toBeNull();
  });
});

describe('TournamentsNotificationCron — registration opened', () => {
  it('skips dispatchMany when no opted-in users (but still stamps)', async () => {
    const tournamentId = new Types.ObjectId();
    const { cron, dispatcher, modelUpdateOne } = buildCron({
      matchingDocs: [
        {
          _id: tournamentId,
          status: 'registration_open',
          notifiedRegistrationOpenAt: null,
          content: { en: { name: 'Cup' } },
        },
      ],
      optedIn: [],
    });
    await cron.runRegistrationOpened();
    expect(dispatcher.dispatchMany).not.toHaveBeenCalled();
    expect(modelUpdateOne).toHaveBeenCalledWith(
      { _id: tournamentId },
      { $set: { notifiedRegistrationOpenAt: expect.any(Date) as unknown } },
    );
  });

  it('fans out to opted-in users and stamps', async () => {
    const tournamentId = new Types.ObjectId();
    const optedIn = [new Types.ObjectId(), new Types.ObjectId()];
    const { cron, dispatcher } = buildCron({
      matchingDocs: [
        {
          _id: tournamentId,
          status: 'registration_open',
          notifiedRegistrationOpenAt: null,
          content: { en: { name: 'Cup' } },
        },
      ],
      optedIn,
    });
    await cron.runRegistrationOpened();
    expect(dispatcher.dispatchMany).toHaveBeenCalledWith(
      [optedIn[0].toHexString(), optedIn[1].toHexString()],
      expect.objectContaining({
        category: 'tournament_registration_opened',
        url: `/tournaments/${tournamentId.toHexString()}`,
      }),
    );
  });
});
