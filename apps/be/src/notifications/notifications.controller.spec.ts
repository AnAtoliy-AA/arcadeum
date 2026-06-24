import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Request } from 'express';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

function buildRequest(user: { userId: string } = { userId: 'u1' }): Request {
  return { user } as unknown as Request;
}

function buildAnonymousRequest(): Request {
  return {} as unknown as Request;
}

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: jest.Mocked<NotificationsService>;
  let config: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    service = {
      addSubscription: jest.fn().mockResolvedValue(undefined),
      removeSubscription: jest.fn().mockResolvedValue(undefined),
      getPreferences: jest.fn().mockResolvedValue({
        daily_reward_ready: false,
        tournament_starting_soon: false,
        tournament_registration_opened: false,
        announcement_new: false,
      }),
      updatePreferences: jest.fn().mockResolvedValue({
        daily_reward_ready: true,
        tournament_starting_soon: false,
        tournament_registration_opened: false,
        announcement_new: false,
      }),
      listInbox: jest.fn().mockResolvedValue([]),
      unreadCount: jest.fn().mockResolvedValue(3),
      markRead: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<NotificationsService>;

    config = {
      get: jest.fn().mockReturnValue('VAPID_PUB_TEST'),
    } as unknown as jest.Mocked<ConfigService>;

    const moduleRef = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: service },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    controller = moduleRef.get(NotificationsController);
  });

  it('GET /vapid-public-key returns the configured key', () => {
    expect(controller.getVapidPublicKey()).toEqual({
      publicKey: 'VAPID_PUB_TEST',
    });
  });

  it('GET /vapid-public-key returns empty string when env not set', () => {
    config.get.mockReturnValueOnce(undefined);
    expect(controller.getVapidPublicKey()).toEqual({ publicKey: '' });
  });

  it('POST /subscriptions delegates to service.addSubscription', async () => {
    await controller.addSubscription(buildRequest(), {
      endpoint: 'https://e/1',
      keys: { p256dh: 'p', auth: 'a' },
    });
    expect(service.addSubscription).toHaveBeenCalledWith('u1', {
      endpoint: 'https://e/1',
      keys: { p256dh: 'p', auth: 'a' },
    });
  });

  it('DELETE /subscriptions delegates to service.removeSubscription', async () => {
    await controller.removeSubscription(buildRequest(), {
      endpoint: 'https://e/1',
    });
    expect(service.removeSubscription).toHaveBeenCalledWith(
      'u1',
      'https://e/1',
    );
  });

  it('GET /preferences delegates to service.getPreferences', async () => {
    const prefs = await controller.getPreferences(buildRequest());
    expect(prefs.daily_reward_ready).toBe(false);
    expect(service.getPreferences).toHaveBeenCalledWith('u1');
  });

  it('PUT /preferences delegates to service.updatePreferences', async () => {
    const prefs = await controller.updatePreferences(buildRequest(), {
      daily_reward_ready: true,
    });
    expect(prefs.daily_reward_ready).toBe(true);
    expect(service.updatePreferences).toHaveBeenCalledWith('u1', {
      daily_reward_ready: true,
    });
  });

  it('GET / lists inbox with limit + before forwarded', async () => {
    const before = new Date('2026-05-01T00:00:00Z');
    await controller.listInbox(buildRequest(), { limit: 10, before });
    expect(service.listInbox).toHaveBeenCalledWith('u1', {
      limit: 10,
      before,
    });
  });

  it('GET /unread-count returns wrapped count', async () => {
    const result = await controller.unreadCount(buildRequest());
    expect(result).toEqual({ count: 3 });
  });

  it('POST /read delegates with ids', async () => {
    await controller.markRead(buildRequest(), {
      ids: ['64a000000000000000000001'],
    });
    expect(service.markRead).toHaveBeenCalledWith('u1', {
      ids: ['64a000000000000000000001'],
      all: undefined,
    });
  });

  it('POST /read delegates with all=true', async () => {
    await controller.markRead(buildRequest(), { all: true });
    expect(service.markRead).toHaveBeenCalledWith('u1', {
      ids: undefined,
      all: true,
    });
  });

  it('throws UnauthorizedException when req.user is missing on guarded routes', async () => {
    await expect(
      controller.getPreferences(buildAnonymousRequest()),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
