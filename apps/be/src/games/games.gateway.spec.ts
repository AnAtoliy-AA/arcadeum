import { BadRequestException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { ExplodingCatsGateway } from './exploding-cats.gateway';
import { GamesService } from './games.service';
import { ExplodingCatsService } from './exploding-cats/exploding-cats.service';
import type {
  StartExplodingCatsSessionResult,
  GameSessionSummary,
} from './games.types';

describe('ExplodingCatsGateway', () => {
  let gateway: ExplodingCatsGateway;
  let gamesService: jest.Mocked<GamesService>;
  let explodingCatsService: jest.Mocked<ExplodingCatsService>;
  let client: jest.Mocked<Pick<Socket, 'emit'>>;

  // Standalone mock functions to avoid unbound-method ESLint errors
  const mockStartSession = jest.fn();
  const mockDrawCard = jest.fn();
  const mockPlayActionByRoom = jest.fn();
  const mockPlayCatComboByRoom = jest.fn();
  const mockFindSessionByRoom = jest.fn();
  const mockEmit = jest.fn();

  beforeEach(() => {
    mockStartSession.mockReset();
    mockDrawCard.mockReset();
    mockPlayActionByRoom.mockReset();
    mockPlayCatComboByRoom.mockReset();
    mockFindSessionByRoom.mockReset();
    mockEmit.mockReset();

    gamesService = {
      findSessionByRoom: mockFindSessionByRoom,
      getRoom: jest.fn(),
    } as unknown as jest.Mocked<GamesService>;

    explodingCatsService = {
      startSession: mockStartSession,
      drawCard: mockDrawCard,
      playActionByRoom: mockPlayActionByRoom,
      playCatComboByRoom: mockPlayCatComboByRoom,
      playFavorByRoom: jest.fn(),
      seeTheFutureByRoom: jest.fn(),
      postHistoryNote: jest.fn(),
    } as unknown as jest.Mocked<ExplodingCatsService>;

    gateway = new ExplodingCatsGateway(
      gamesService as unknown as GamesService,
      explodingCatsService as unknown as ExplodingCatsService,
    );

    client = {
      emit: mockEmit,
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
          gameId: 'exploding_kittens_v1',
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
          gameId: 'exploding_kittens_v1',
          engine: 'custom-engine',
          status: 'active',
          state: { example: true },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      mockStartSession.mockResolvedValue(result);

      await gateway.handleSessionStart(client as unknown as Socket, payload);

      expect(mockStartSession).toHaveBeenCalledWith(
        'host-456',
        'room-123',
        'custom-engine',
      );
      expect(mockEmit).toHaveBeenCalledWith('games.session.started', result);
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
      mockStartSession.mockRejectedValue(
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

      mockFindSessionByRoom.mockResolvedValue({
        id: 'session-1',
      } as GameSessionSummary);

      mockDrawCard.mockResolvedValue({
        id: 'session-1',
        roomId: 'room-123',
        gameId: 'exploding_kittens_v1',
        engine: 'exploding_kittens_v1',
        status: 'active',
        state: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await gateway.handleSessionDraw(client as unknown as Socket, payload);

      expect(mockDrawCard).toHaveBeenCalledWith('session-1', 'guest-2');
      expect(mockEmit).toHaveBeenCalledWith('games.session.drawn', {
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
      mockFindSessionByRoom.mockResolvedValue({
        id: 'session-1',
      } as GameSessionSummary);
      mockDrawCard.mockRejectedValue(new BadRequestException('Deck is empty.'));

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

  describe('handleSessionPlayAction', () => {
    it('plays an action card and emits acknowledgement', async () => {
      const payload = {
        roomId: ' room-123 ',
        userId: ' host-456 ',
        card: ' attack ',
      };

      mockPlayActionByRoom.mockResolvedValue({
        id: 'session-1',
        roomId: 'room-123',
        gameId: 'exploding_kittens_v1',
        engine: 'exploding_kittens_v1',
        status: 'active',
        state: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await gateway.handleSessionPlayAction(
        client as unknown as Socket,
        payload,
      );

      expect(mockPlayActionByRoom).toHaveBeenCalledWith(
        'host-456',
        'room-123',
        'attack',
      );
      expect(mockEmit).toHaveBeenCalledWith('games.session.action.played', {
        roomId: 'room-123',
        userId: 'host-456',
        card: 'attack',
      });
    });

    it('throws when payload is missing required fields', async () => {
      await expect(
        gateway.handleSessionPlayAction(client as unknown as Socket, {
          roomId: 'room-123',
          userId: 'host-456',
          card: undefined,
        }),
      ).rejects.toBeInstanceOf(WsException);
    });

    it('wraps service errors in WsException', async () => {
      mockPlayActionByRoom.mockRejectedValue(
        new BadRequestException('Cannot play this card right now.'),
      );

      expect.assertions(2);

      try {
        await gateway.handleSessionPlayAction(client as unknown as Socket, {
          roomId: 'room-123',
          userId: 'host-456',
          card: 'skip',
        });
        throw new Error('Expected handleSessionPlayAction to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WsException);
        expect((error as WsException).message).toBe(
          'Cannot play this card right now.',
        );
      }
    });
  });

  describe('handleSessionPlayCatCombo', () => {
    it('plays a cat combo and emits acknowledgement', async () => {
      const payload = {
        roomId: ' room-123 ',
        userId: ' host-456 ',
        cat: ' tacocat ',
        mode: ' pair ',
        targetPlayerId: ' guest-2 ',
        selectedIndex: 0,
      };

      mockPlayCatComboByRoom.mockResolvedValue({
        id: 'session-1',
        roomId: 'room-123',
        gameId: 'exploding_kittens_v1',
        engine: 'exploding_kittens_v1',
        status: 'active',
        state: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await gateway.handleSessionPlayCatCombo(
        client as unknown as Socket,
        payload,
      );

      expect(mockPlayCatComboByRoom).toHaveBeenCalledWith(
        'host-456',
        'room-123',
        'tacocat',
        {
          mode: 'pair',
          targetPlayerId: 'guest-2',
          desiredCard: undefined,
          selectedIndex: 0,
        },
      );
      expect(mockEmit).toHaveBeenCalledWith(
        'games.session.cat_combo.played',
        expect.objectContaining({
          roomId: 'room-123',
          userId: 'host-456',
          cat: 'tacocat',
          mode: 'pair',
          targetPlayerId: 'guest-2',
          selectedIndex: 0,
        }),
      );
    });

    it('throws when required fields are missing', async () => {
      await expect(
        gateway.handleSessionPlayCatCombo(client as unknown as Socket, {
          roomId: 'room-123',
          userId: 'host-456',
          cat: undefined,
          mode: 'pair',
          targetPlayerId: 'guest-2',
          selectedIndex: 0,
        }),
      ).rejects.toBeInstanceOf(WsException);
    });

    it('wraps service errors in WsException', async () => {
      mockPlayCatComboByRoom.mockRejectedValue(
        new BadRequestException('Combo not allowed.'),
      );

      expect.assertions(2);

      try {
        await gateway.handleSessionPlayCatCombo(client as unknown as Socket, {
          roomId: 'room-123',
          userId: 'host-456',
          cat: 'tacocat',
          mode: 'pair',
          targetPlayerId: 'guest-2',
          selectedIndex: 0,
        });
        throw new Error('Expected handleSessionPlayCatCombo to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WsException);
        expect((error as WsException).message).toBe('Combo not allowed.');
      }
    });
  });
});
