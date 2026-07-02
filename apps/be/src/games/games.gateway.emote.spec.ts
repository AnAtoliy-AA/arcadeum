import { WsException } from '@nestjs/websockets';
import type { Socket, Server } from 'socket.io';
import { GamesGateway } from './games.gateway';
import { GamesService } from './games.service';
import { GamesRealtimeService } from './games.realtime.service';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';

describe('GamesGateway – emote handler', () => {
  let gateway: GamesGateway;
  let gamesService: jest.Mocked<GamesService>;
  let realtime: jest.Mocked<GamesRealtimeService>;
  let server: jest.Mocked<Server>;
  let client: jest.Mocked<Socket>;
  const mockEmit = jest.fn();
  const mockServerTo = jest.fn();
  const mockServerEmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    gamesService = {
      postHistoryNote: jest.fn(),
    } as unknown as jest.Mocked<GamesService>;

    realtime = {
      roomChannel: jest.fn((id: string) => `game-room:${id}`),
      spectatorChannel: jest.fn((id: string) => `game-room-spectators:${id}`),
      emitToRoom: jest.fn(),
    } as unknown as jest.Mocked<GamesRealtimeService>;

    server = {
      to: mockServerTo.mockReturnValue({ emit: mockServerEmit }),
    } as unknown as jest.Mocked<Server>;

    client = {
      rooms: new Set(['game-room:room-1']),
      emit: mockEmit,
      data: {},
    } as unknown as jest.Mocked<Socket>;

    gateway = new GamesGateway(gamesService, realtime);
    (gateway as unknown as { server: Server }).server = server;
  });

  describe('handleEmote', () => {
    it('broadcasts valid emote to room and spectator channel', () => {
      gateway.handleEmote(client, {
        roomId: 'room-1',
        userId: 'user-a',
        emoteId: 'good_move',
      });

      expect(mockServerTo).toHaveBeenCalledWith('game-room:room-1');
      expect(mockServerEmit).toHaveBeenCalledWith(
        'games.session.emote',
        maybeEncrypt({
          userId: 'user-a',
          emoteId: 'good_move',
          ts: expect.any(Number) as unknown,
        }),
      );

      expect(mockServerTo).toHaveBeenCalledWith('game-room-spectators:room-1');
      expect(mockServerEmit).toHaveBeenCalledTimes(2);
    });

    it('rejects invalid emoteId', () => {
      gateway.handleEmote(client, {
        roomId: 'room-1',
        userId: 'user-a',
        emoteId: 'invalid_emote',
      });

      expect(mockServerTo).not.toHaveBeenCalled();
      expect(mockServerEmit).not.toHaveBeenCalled();
    });

    it('does nothing when client is not in the room', () => {
      const outsider = {
        rooms: new Set(['other-room']),
        emit: mockEmit,
        data: {},
      } as unknown as jest.Mocked<Socket>;

      gateway.handleEmote(outsider, {
        roomId: 'room-1',
        userId: 'user-a',
        emoteId: 'lol',
      });

      expect(mockServerTo).not.toHaveBeenCalled();
    });

    it('throws WsException when roomId is missing', () => {
      expect(() =>
        gateway.handleEmote(client, {
          roomId: '',
          userId: 'user-a',
          emoteId: 'nice',
        }),
      ).toThrow(WsException);
    });

    it('throws WsException when userId is missing', () => {
      expect(() =>
        gateway.handleEmote(client, {
          roomId: 'room-1',
          userId: '',
          emoteId: 'thinking',
        }),
      ).toThrow(WsException);
    });

    it('throws WsException when emoteId is missing', () => {
      expect(() =>
        gateway.handleEmote(client, {
          roomId: 'room-1',
          userId: 'user-a',
          emoteId: '',
        }),
      ).toThrow(WsException);
    });

    it('accepts all valid emote ids', () => {
      const validIds = [
        'good_move',
        'lol',
        'thinking',
        'nice',
        'unlucky',
        'rip',
      ];

      for (let i = 0; i < validIds.length; i++) {
        const emoteId = validIds[i];
        mockServerTo.mockClear();
        mockServerEmit.mockClear();

        gateway.handleEmote(client, {
          roomId: 'room-1',
          userId: `user-${i}`,
          emoteId,
        });

        expect(mockServerTo).toHaveBeenCalledWith('game-room:room-1');
        expect(mockServerEmit).toHaveBeenCalledWith(
          'games.session.emote',
          maybeEncrypt(expect.objectContaining({ emoteId })),
        );
      }
    });

    it('decrypts encrypted payload when encryption is enabled', () => {
      const encrypted = maybeEncrypt({
        roomId: 'room-1',
        userId: 'user-encrypted',
        emoteId: 'good_move',
      });

      gateway.handleEmote(client, encrypted);

      expect(mockServerTo).toHaveBeenCalledWith('game-room:room-1');
      expect(mockServerEmit).toHaveBeenCalledWith(
        'games.session.emote',
        maybeEncrypt({
          userId: 'user-encrypted',
          emoteId: 'good_move',
          ts: expect.any(Number) as unknown,
        }),
      );
    });

    it('rate limits emotes from same user', () => {
      gateway.handleEmote(client, {
        roomId: 'room-1',
        userId: 'user-rate',
        emoteId: 'good_move',
      });

      expect(mockServerTo).toHaveBeenCalledTimes(2);

      mockServerTo.mockClear();
      mockServerEmit.mockClear();

      gateway.handleEmote(client, {
        roomId: 'room-1',
        userId: 'user-rate',
        emoteId: 'lol',
      });

      expect(mockServerTo).not.toHaveBeenCalled();
    });
  });
});
