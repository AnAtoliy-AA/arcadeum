import { GamesGateway } from './games.gateway';
import type { Socket } from 'socket.io';
import type { JwtService } from '@nestjs/jwt';
import type { ConfigService } from '@nestjs/config';
import type { GamesService } from './games.service';
import type { GamesRealtimeService } from './games.realtime.service';
import type { GameSessionsService } from './sessions/game-sessions.service';
import type { GameRoomsMatchmakingService } from './rooms/game-rooms.matchmaking.service';

describe('GamesGateway anonymous socket connection', () => {
  let gateway: GamesGateway;
  let mockRealtime: {
    trackSocket: jest.Mock;
    lobbyChannel: jest.Mock;
    registerServer: jest.Mock;
  };
  let mockJwt: { verifyAsync: jest.Mock };
  let mockConfig: { get: jest.Mock };

  beforeEach(() => {
    mockRealtime = {
      trackSocket: jest.fn().mockResolvedValue(undefined),
      lobbyChannel: jest.fn().mockReturnValue('games:lobby'),
      registerServer: jest.fn(),
    };
    mockJwt = {
      verifyAsync: jest.fn().mockRejectedValue(new Error('no token')),
    };
    mockConfig = {
      get: jest.fn().mockReturnValue(undefined),
    };

    gateway = new GamesGateway(
      {} as unknown as GamesService,
      mockRealtime as unknown as GamesRealtimeService,
      {} as unknown as GameSessionsService,
      mockJwt as unknown as JwtService,
      mockConfig as unknown as ConfigService,
      {} as unknown as GameRoomsMatchmakingService,
      [],
    );
  });

  function createMockSocket(
    auth?: Record<string, unknown>,
    query?: Record<string, unknown>,
  ): Socket {
    return {
      id: 'socket-123',
      handshake: {
        auth: auth ?? {},
        query: query ?? {},
      },
      data: {},
      join: jest.fn().mockResolvedValue(undefined),
      emit: jest.fn(),
      on: jest.fn(),
    } as unknown as Socket;
  }

  it('extracts anonId from handshake auth', async () => {
    const socket = createMockSocket({ anonId: 'anon_abc123' });
    await gateway.handleConnection(socket);

    expect((socket.data as { anonId?: string }).anonId).toBe('anon_abc123');
    expect(mockRealtime.trackSocket).toHaveBeenCalledWith(
      'anon_abc123',
      'socket-123',
    );
  });

  it('extracts anonId from handshake query as fallback', async () => {
    const socket = createMockSocket({}, { anonId: 'anon_xyz789' });
    await gateway.handleConnection(socket);

    expect((socket.data as { anonId?: string }).anonId).toBe('anon_xyz789');
    expect(mockRealtime.trackSocket).toHaveBeenCalledWith(
      'anon_xyz789',
      'socket-123',
    );
  });

  it('falls back to guest_<id> when anonId is missing', async () => {
    const socket = createMockSocket({}, {});
    await gateway.handleConnection(socket);

    expect((socket.data as { anonId?: string }).anonId).toBe(
      'guest_socket-123',
    );
    expect(mockRealtime.trackSocket).toHaveBeenCalledWith(
      'guest_socket-123',
      'socket-123',
    );
  });
});
