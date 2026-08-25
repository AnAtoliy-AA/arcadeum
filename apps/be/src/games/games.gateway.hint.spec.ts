import { WsException } from '@nestjs/websockets';
import type { Socket, Server } from 'socket.io';
import { GamesGateway } from './games.gateway';
import { GamesService } from './games.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import { ChessBotService } from './engines/chess/chess-bot.service';
import { GamesRealtimeService } from './games.realtime.service';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import type {
  ChessMove,
  ChessState,
} from '@arcadeum/games-core/games/chess/chess.types';

const mockJwt = {} as never;
const mockConfig = {} as never;

const BOT_MOVE: ChessMove = {
  from: { file: 'e', rank: 2 },
  to: { file: 'e', rank: 4 },
  piece: { type: 'pawn', color: 'white' },
  captured: null,
  promotion: null,
  isCastle: false,
  isEnPassant: false,
  notation: 'e4',
};

function makeChessState(
  overrides: Partial<Pick<ChessState, 'currentTurnColor'>> = {},
): ChessState {
  return {
    players: [
      { playerId: 'user-a', color: 'white', isBot: false },
      { playerId: 'bot-b', color: 'black', isBot: true },
    ],
    currentTurnColor: 'white',
    ...overrides,
  } as unknown as ChessState;
}

describe('GamesGateway – hint handler', () => {
  let gateway: GamesGateway;
  let gamesService: jest.Mocked<GamesService>;
  let sessionsService: jest.Mocked<GameSessionsService>;
  let chessBotService: jest.Mocked<ChessBotService>;
  let realtime: jest.Mocked<GamesRealtimeService>;
  let server: jest.Mocked<Server>;
  let client: jest.Mocked<Socket>;
  const mockEmit = jest.fn();

  let sessionFixture: Record<string, unknown>;
  let roomFixture: Record<string, unknown>;

  beforeEach(() => {
    jest.clearAllMocks();

    sessionFixture = {
      id: 'session-1',
      roomId: 'room-1',
      gameId: 'chess_v1',
      status: 'active',
      state: makeChessState(),
    };
    roomFixture = { id: 'room-1', gameOptions: {} };

    gamesService = {
      getRoom: jest.fn().mockResolvedValue(roomFixture),
    } as unknown as jest.Mocked<GamesService>;

    sessionsService = {
      getSession: jest.fn().mockResolvedValue(sessionFixture),
    } as unknown as jest.Mocked<GameSessionsService>;

    chessBotService = {
      findBestMove: jest.fn().mockReturnValue(BOT_MOVE),
    } as unknown as jest.Mocked<ChessBotService>;

    realtime = {
      roomChannel: jest.fn((id: string) => `game-room:${id}`),
      spectatorChannel: jest.fn((id: string) => `game-room-spectators:${id}`),
      emitToRoom: jest.fn(),
    } as unknown as jest.Mocked<GamesRealtimeService>;

    server = {
      to: jest.fn(),
    } as unknown as jest.Mocked<Server>;

    client = {
      rooms: new Set(['game-room:room-1']),
      emit: mockEmit,
      // Identity checks fail closed — the socket presents a verified id.
      data: { authenticated: true, userId: 'user-a' },
    } as unknown as jest.Mocked<Socket>;

    // Inert stand-ins for matchmaking and the per-game gateways; only the
    // hint handler (declared on GamesGateway itself) is exercised here.
    const inert = { handlers: {} };
    gateway = new GamesGateway(
      gamesService,
      realtime,
      sessionsService,
      mockJwt,
      mockConfig,
      inert as never, // matchmaking
      inert as never, // checkers
      inert as never, // tic-tac-toe
      inert as never, // chess
      inert as never, // cascade
      inert as never, // cat dash
      inert as never, // texas hold'em
      inert as never, // critical
      inert as never, // critical actions
      inert as never, // sea battle
      inert as never, // glimworm
      inert as never, // backgammon
      inert as never, // hearts
      inert as never, // spades
      inert as never, // go handler
      chessBotService,
    );
    (gateway as unknown as { server: Server }).server = server;
  });

  it('emits ok:true with the serialized bot move to the requesting socket', async () => {
    await gateway.onRequestHint(client, {
      roomId: 'room-1',
      sessionId: 'session-1',
      userId: 'user-a',
    });

    expect(sessionsService.getSession).toHaveBeenCalledWith('session-1');
    expect(gamesService.getRoom).toHaveBeenCalledWith('room-1');
    expect(chessBotService.findBestMove).toHaveBeenCalledWith(
      expect.objectContaining({ botDifficulty: 'expert' }),
    );
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenCalledWith(
      'games.session.hint_result',
      maybeEncrypt({
        ok: true,
        roomId: 'room-1',
        sessionId: 'session-1',
        move: {
          from: { file: 'e', rank: 2 },
          to: { file: 'e', rank: 4 },
          piece: { type: 'pawn', color: 'white' },
          captured: null,
          promotion: null,
          isCastle: false,
        },
        ts: expect.any(Number) as unknown,
      }),
    );
    expect(server.to).not.toHaveBeenCalled();
  });

  it('decrypts encrypted payload when encryption is enabled', async () => {
    const encrypted = maybeEncrypt({
      roomId: 'room-1',
      sessionId: 'session-1',
      userId: 'user-a',
    });

    await gateway.onRequestHint(client, encrypted);

    expect(mockEmit).toHaveBeenCalledWith(
      'games.session.hint_result',
      maybeEncrypt(expect.objectContaining({ ok: true })),
    );
  });

  it('rejects with reason "ranked" for ranked rooms without computing a move', async () => {
    roomFixture.gameOptions = { ranked: true };

    await gateway.onRequestHint(client, {
      roomId: 'room-1',
      sessionId: 'session-1',
      userId: 'user-a',
    });

    expect(chessBotService.findBestMove).not.toHaveBeenCalled();
    expect(mockEmit).toHaveBeenCalledWith(
      'games.session.hint_result',
      maybeEncrypt({
        ok: false,
        roomId: 'room-1',
        sessionId: 'session-1',
        reason: 'ranked',
        ts: expect.any(Number) as unknown,
      }),
    );
  });

  it('rejects with reason "unsupported_game" for non-chess sessions', async () => {
    sessionFixture.gameId = 'tic_tac_toe_v1';

    await gateway.onRequestHint(client, {
      roomId: 'room-1',
      sessionId: 'session-1',
      userId: 'user-a',
    });

    expect(chessBotService.findBestMove).not.toHaveBeenCalled();
    expect(mockEmit).toHaveBeenCalledWith(
      'games.session.hint_result',
      maybeEncrypt(
        expect.objectContaining({ ok: false, reason: 'unsupported_game' }),
      ),
    );
  });

  it('rejects with reason "not_participant" when requester is not a player', async () => {
    // A properly-authenticated spectator (their own identity) who is not a
    // participant of the session.
    const spectatorClient = {
      rooms: new Set(['game-room:room-1']),
      emit: mockEmit,
      data: { authenticated: true, userId: 'user-spectator' },
    } as unknown as jest.Mocked<Socket>;

    await gateway.onRequestHint(spectatorClient, {
      roomId: 'room-1',
      sessionId: 'session-1',
      userId: 'user-spectator',
    });

    expect(mockEmit).toHaveBeenCalledWith(
      'games.session.hint_result',
      maybeEncrypt(
        expect.objectContaining({ ok: false, reason: 'not_participant' }),
      ),
    );
  });

  it('rejects with reason "game_over" when the session is completed', async () => {
    sessionFixture.status = 'completed';

    await gateway.onRequestHint(client, {
      roomId: 'room-1',
      sessionId: 'session-1',
      userId: 'user-a',
    });

    expect(mockEmit).toHaveBeenCalledWith(
      'games.session.hint_result',
      maybeEncrypt(expect.objectContaining({ ok: false, reason: 'game_over' })),
    );
  });

  it('rejects with reason "not_your_turn" when it is not the requester’s turn', async () => {
    sessionFixture.state = makeChessState({ currentTurnColor: 'black' });

    await gateway.onRequestHint(client, {
      roomId: 'room-1',
      sessionId: 'session-1',
      userId: 'user-a',
    });

    expect(chessBotService.findBestMove).not.toHaveBeenCalled();
    expect(mockEmit).toHaveBeenCalledWith(
      'games.session.hint_result',
      maybeEncrypt(
        expect.objectContaining({ ok: false, reason: 'not_your_turn' }),
      ),
    );
  });

  it('silently ignores requests from clients that are not in the room', async () => {
    const outsider = {
      rooms: new Set(['other-room']),
      emit: mockEmit,
      data: { authenticated: true, userId: 'user-a' },
    } as unknown as jest.Mocked<Socket>;

    await gateway.onRequestHint(outsider, {
      roomId: 'room-1',
      sessionId: 'session-1',
      userId: 'user-a',
    });

    expect(sessionsService.getSession).not.toHaveBeenCalled();
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('throws WsException when required fields are missing', async () => {
    await expect(
      gateway.onRequestHint(client, { roomId: 'room-1', userId: 'user-a' }),
    ).rejects.toThrow(WsException);
  });

  it('throws WsException when the session does not exist', async () => {
    sessionsService.getSession = jest
      .fn()
      .mockRejectedValue(new Error('Session not found: nope'));

    await expect(
      gateway.onRequestHint(client, {
        roomId: 'room-1',
        sessionId: 'nope',
        userId: 'user-a',
      }),
    ).rejects.toThrow(WsException);
  });

  it('throws WsException when the session belongs to another room', async () => {
    sessionFixture.roomId = 'room-2';

    await expect(
      gateway.onRequestHint(client, {
        roomId: 'room-1',
        sessionId: 'session-1',
        userId: 'user-a',
      }),
    ).rejects.toThrow(WsException);
  });
});
