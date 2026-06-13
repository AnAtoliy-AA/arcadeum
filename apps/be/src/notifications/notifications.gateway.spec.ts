import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';
import {
  NotificationsGateway,
  type InboxNotificationDto,
} from './notifications.gateway';

function buildGateway(): {
  gateway: NotificationsGateway;
  jwt: { verifyAsync: jest.Mock };
  toMock: jest.Mock;
  emitMock: jest.Mock;
} {
  const emitMock = jest.fn();
  const toMock = jest.fn().mockReturnValue({ emit: emitMock });
  const server = { to: toMock } as unknown as Server;
  const jwt = { verifyAsync: jest.fn() };
  const config = {
    get: jest.fn().mockReturnValue('test-secret'),
  } as unknown as ConfigService;
  const gateway = new NotificationsGateway(
    jwt as unknown as JwtService,
    config,
  );
  (gateway as unknown as { server: Server }).server = server;
  return { gateway, jwt, toMock, emitMock };
}

function fakeSocket(token: unknown): Socket {
  return {
    id: 'socket-1',
    handshake: { auth: { token } },
    data: {},
    join: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
  } as unknown as Socket;
}

describe('NotificationsGateway', () => {
  describe('handleConnection', () => {
    it('disconnects clients with no token', async () => {
      const { gateway } = buildGateway();
      const sock = fakeSocket('');
      await gateway.handleConnection(sock);
      expect(sock.disconnect).toHaveBeenCalledWith(true);
    });

    it('disconnects when token is not a string', async () => {
      const { gateway } = buildGateway();
      const sock = fakeSocket({ not: 'a string' });
      await gateway.handleConnection(sock);
      expect(sock.disconnect).toHaveBeenCalledWith(true);
    });

    it('joins room user:<sub> on valid token', async () => {
      const { gateway, jwt } = buildGateway();
      jwt.verifyAsync.mockResolvedValue({ sub: 'user-123' });
      const sock = fakeSocket('valid-token');
      await gateway.handleConnection(sock);
      expect(sock.join).toHaveBeenCalledWith('user:user-123');
      expect(sock.disconnect).not.toHaveBeenCalled();
    });

    it('disconnects when verifyAsync throws', async () => {
      const { gateway, jwt } = buildGateway();
      jwt.verifyAsync.mockRejectedValue(new Error('bad token'));
      const sock = fakeSocket('bad-token');
      await gateway.handleConnection(sock);
      expect(sock.disconnect).toHaveBeenCalledWith(true);
    });
  });

  describe('emit methods', () => {
    const sampleDto: InboxNotificationDto = {
      id: 'n-1',
      category: 'announcement_new',
      titleKey: 't',
      bodyKey: 'b',
      i18nParams: {},
      url: '/x',
      data: {},
      read: false,
      createdAt: new Date().toISOString(),
    };

    it('emitNew targets the user room with notification:new', () => {
      const { gateway, toMock, emitMock } = buildGateway();
      gateway.emitNew('user-7', sampleDto);
      expect(toMock).toHaveBeenCalledWith('user:user-7');
      expect(emitMock).toHaveBeenCalledWith('notification:new', sampleDto);
    });

    it('emitUnreadCount targets the user room with notification:unread-count', () => {
      const { gateway, toMock, emitMock } = buildGateway();
      gateway.emitUnreadCount('user-7', 3);
      expect(toMock).toHaveBeenCalledWith('user:user-7');
      expect(emitMock).toHaveBeenCalledWith('notification:unread-count', {
        count: 3,
      });
    });
  });
});
