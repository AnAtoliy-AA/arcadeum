import { ConfigService } from '@nestjs/config';

const sendNotificationMock = jest.fn();
const setVapidDetailsMock = jest.fn();

jest.mock('web-push', () => ({
  __esModule: true,
  default: {
    setVapidDetails: setVapidDetailsMock,
    sendNotification: sendNotificationMock,
  },
}));

import { PushSender, SubscriptionGoneError } from './push-sender';

function buildConfig(
  values: Record<string, string | undefined>,
): ConfigService {
  return {
    get: (key: string) => values[key],
  } as unknown as ConfigService;
}

const sampleSub = {
  endpoint: 'https://push.example/sub-1',
  keys: { p256dh: 'p', auth: 'a' },
};

const samplePayload = {
  title: 'Hi',
  body: 'World',
  url: '/home',
  notificationId: 'n1',
};

beforeEach(() => {
  sendNotificationMock.mockReset();
  setVapidDetailsMock.mockReset();
});

describe('PushSender', () => {
  it('stays disabled when any VAPID env is missing', async () => {
    const sender = new PushSender(buildConfig({}));
    expect(sender.isEnabled()).toBe(false);
    await sender.sendOne(sampleSub, samplePayload);
    expect(sendNotificationMock).not.toHaveBeenCalled();
  });

  it('configures VAPID details when all envs present', () => {
    new PushSender(
      buildConfig({
        VAPID_PUBLIC_KEY: 'pub',
        VAPID_PRIVATE_KEY: 'priv',
        VAPID_SUBJECT: 'mailto:x@y',
      }),
    );
    expect(setVapidDetailsMock).toHaveBeenCalledWith(
      'mailto:x@y',
      'pub',
      'priv',
    );
  });

  it('sendAll returns the count of successful sends', async () => {
    sendNotificationMock.mockResolvedValue(undefined);
    const sender = enabledSender();
    const subs = [sampleSub, { ...sampleSub, endpoint: 'https://push/2' }];
    const onGone = jest.fn();
    const count = await sender.sendAll(subs, samplePayload, onGone);
    expect(count).toBe(2);
    expect(onGone).not.toHaveBeenCalled();
  });

  it('sendAll calls onGone for 404 responses and continues', async () => {
    sendNotificationMock
      .mockRejectedValueOnce({ statusCode: 404 })
      .mockResolvedValueOnce(undefined);
    const sender = enabledSender();
    const subs = [sampleSub, { ...sampleSub, endpoint: 'https://push/2' }];
    const onGone = jest.fn();
    const count = await sender.sendAll(subs, samplePayload, onGone);
    expect(count).toBe(1);
    expect(onGone).toHaveBeenCalledWith(sampleSub.endpoint);
  });

  it('sendAll calls onGone for 410 responses', async () => {
    sendNotificationMock.mockRejectedValueOnce({ statusCode: 410 });
    const sender = enabledSender();
    const onGone = jest.fn();
    await sender.sendAll([sampleSub], samplePayload, onGone);
    expect(onGone).toHaveBeenCalledWith(sampleSub.endpoint);
  });

  it('sendAll does NOT call onGone for 500 responses, just logs', async () => {
    sendNotificationMock.mockRejectedValueOnce({ statusCode: 500 });
    const sender = enabledSender();
    const onGone = jest.fn();
    const count = await sender.sendAll([sampleSub], samplePayload, onGone);
    expect(count).toBe(0);
    expect(onGone).not.toHaveBeenCalled();
  });

  it('sendOne throws SubscriptionGoneError on 410', async () => {
    sendNotificationMock.mockRejectedValueOnce({ statusCode: 410 });
    const sender = enabledSender();
    await expect(
      sender.sendOne(sampleSub, samplePayload),
    ).rejects.toBeInstanceOf(SubscriptionGoneError);
  });
});

function enabledSender(): PushSender {
  return new PushSender(
    buildConfig({
      VAPID_PUBLIC_KEY: 'pub',
      VAPID_PRIVATE_KEY: 'priv',
      VAPID_SUBJECT: 'mailto:x@y',
    }),
  );
}
