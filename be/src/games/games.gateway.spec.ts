import { BadRequestException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { GamesGateway } from './games.gateway';
import type { GamesRealtimeService } from './games.realtime.service';
import type {
  GamesService,
  StartExplodingCatsSessionResult,
} from './games.service';

describe('GamesGateway', () => {
  let gateway: GamesGateway;
  let gamesService: jest.Mocked<
    Pick<GamesService, 'startExplodingCatsSession' | 'drawExplodingCatsCard'>
  >;
  let realtime: jest.Mocked<Partial<GamesRealtimeService>>;
  let client: jest.Mocked<Pick<Socket, 'emit'>>;

  beforeEach(() => {
    gamesService = {
      startExplodingCatsSession: jest.fn(),
      drawExplodingCatsCard: jest.fn(),
    } as jest.Mocked<
      Pick<GamesService, 'startExplodingCatsSession' | 'drawExplodingCatsCard'>
    >;

    realtime = {} as jest.Mocked<Partial<GamesRealtimeService>>;

    gateway = new GamesGateway(
      gamesService as unknown as GamesService,
      realtime as unknown as GamesRealtimeService,
    );

    client = {
      emit: jest.fn(),
    } as jest.Mocked<Pick<Socket, 'emit'>>;
  });

  describe('handleSessionStart', () => {
    it('starts a session and emits acknowledgement to the caller', async () => {
      const payload = {
        roomId: ' room-123 ',
        userId: ' host-456 ',
        engine: ' custom-engine ',
      };

      const result: StartExplodingCatsSessionResult = {
        room: {
          id: 'room-123',
          gameId: 'exploding-kittens',
          name: 'Test Room',
          hostId: 'host-456',
          visibility: 'public',
          playerCount: 2,
          maxPlayers: 5,
          createdAt: new Date().toISOString(),
          status: 'in_progress',
          inviteCode: 'CODE12',
        },
        session: {
          id: 'session-789',
          roomId: 'room-123',
          gameId: 'exploding-kittens',
          engine: 'custom-engine',
          status: 'active',
          state: { example: true },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      gamesService.startExplodingCatsSession.mockResolvedValue(result);

      await gateway.handleSessionStart(client as unknown as Socket, payload);

      expect(gamesService.startExplodingCatsSession).toHaveBeenCalledWith(
        'host-456',
        'room-123',
        'custom-engine',
      );
      expect(client.emit).toHaveBeenCalledWith('games.session.started', result);
    });

    it('throws when required identifiers are missing', async () => {
      await expect(
        gateway.handleSessionStart(client as unknown as Socket, {
          roomId: '',
          userId: undefined,
        }),
      ).rejects.toBeInstanceOf(WsException);
    });

    it('wraps service errors in WsException', async () => {
      gamesService.startExplodingCatsSession.mockRejectedValue(
        new BadRequestException('Room is no longer active.'),
      );

      expect.assertions(2);

      try {
        await gateway.handleSessionStart(client as unknown as Socket, {
          roomId: 'room-123',
          userId: 'host-456',
        });
        throw new Error('Expected handleSessionStart to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WsException);
        expect((error as WsException).message).toBe(
          'Room is no longer active.',
        );
      }
    });
  });

  describe('handleSessionDraw', () => {
    it('draws a card and emits an acknowledgement', async () => {
      const payload = {
        roomId: ' room-123 ',
        userId: ' guest-2 ',
      };

      gamesService.drawExplodingCatsCard.mockResolvedValue({
        id: 'session-1',
        roomId: 'room-123',
        gameId: 'exploding-kittens',
        engine: 'exploding_cats_v1',
        status: 'active',
        state: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await gateway.handleSessionDraw(client as unknown as Socket, payload);

      expect(gamesService.drawExplodingCatsCard).toHaveBeenCalledWith(
        'guest-2',
        'room-123',
      );
      expect(client.emit).toHaveBeenCalledWith('games.session.drawn', {
        roomId: 'room-123',
        userId: 'guest-2',
      });
    });

    it('throws when identifiers are missing', async () => {
      await expect(
        gateway.handleSessionDraw(client as unknown as Socket, {
          roomId: undefined,
          userId: 'guest-2',
        }),
      ).rejects.toBeInstanceOf(WsException);
    });

    it('wraps draw errors in WsException', async () => {
      gamesService.drawExplodingCatsCard.mockRejectedValue(
        new BadRequestException('Deck is empty.'),
      );

      expect.assertions(2);

      try {
        await gateway.handleSessionDraw(client as unknown as Socket, {
          roomId: 'room-123',
          userId: 'guest-2',
        });
        throw new Error('Expected handleSessionDraw to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WsException);
        expect((error as WsException).message).toBe('Deck is empty.');
      }
    });
  });
});
