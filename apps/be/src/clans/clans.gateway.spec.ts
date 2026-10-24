import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClansGateway } from './clans.gateway';
import type { Socket, Server } from 'socket.io';

describe('ClansGateway', () => {
  let gateway: ClansGateway;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClansGateway,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    gateway = module.get<ClansGateway>(ClansGateway);
  });

  describe('handleJoinRoom and handleLeaveRoom', () => {
    it('joins clan room upon clans.join-room message', async () => {
      const mockClient = {
        join: jest.fn().mockResolvedValue(undefined),
      } as unknown as Socket;

      await gateway.handleJoinRoom(mockClient, { clanId: 'clan_123' });
      expect(mockClient.join).toHaveBeenCalledWith('clan:clan_123');
    });

    it('leaves clan room upon clans.leave-room message', async () => {
      const mockClient = {
        leave: jest.fn().mockResolvedValue(undefined),
      } as unknown as Socket;

      await gateway.handleLeaveRoom(mockClient, { clanId: 'clan_123' });
      expect(mockClient.leave).toHaveBeenCalledWith('clan:clan_123');
    });

    it('ignores empty clanId for join and leave', async () => {
      const mockClient = {
        join: jest.fn(),
        leave: jest.fn(),
      } as unknown as Socket;

      await gateway.handleJoinRoom(mockClient, { clanId: '' });
      await gateway.handleLeaveRoom(mockClient, { clanId: '' });

      expect(mockClient.join).not.toHaveBeenCalled();
      expect(mockClient.leave).not.toHaveBeenCalled();
    });
  });

  describe('emitClanWarUpdated', () => {
    it('emits clan:war-updated to both participating clan rooms', () => {
      const mockEmitA = jest.fn();
      const mockEmitB = jest.fn();
      const mockServer = {
        to: jest.fn().mockImplementation((room: string) => {
          if (room === 'clan:clan_a') return { emit: mockEmitA };
          if (room === 'clan:clan_b') return { emit: mockEmitB };
          return { emit: jest.fn() };
        }),
      } as unknown as Server;

      (gateway as unknown as { server: Server }).server = mockServer;

      const warPayload = { id: 'war_1', status: 'active' };
      gateway.emitClanWarUpdated('clan_a', 'clan_b', warPayload);

      expect(mockServer.to).toHaveBeenCalledWith('clan:clan_a');
      expect(mockServer.to).toHaveBeenCalledWith('clan:clan_b');
      expect(mockEmitA).toHaveBeenCalledWith('clan:war-updated', warPayload);
      expect(mockEmitB).toHaveBeenCalledWith('clan:war-updated', warPayload);
    });
  });
});
