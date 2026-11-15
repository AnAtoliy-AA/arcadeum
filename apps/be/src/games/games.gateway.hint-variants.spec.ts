import type { Socket, Server } from 'socket.io';
import { GamesGateway } from './games.gateway';
import { GamesService } from './games.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import { ChessBotService } from './engines/chess/chess-bot.service';
import { CheckersBotService } from './checkers/checkers-bot.service';
import { BackgammonBotService } from './backgammon/backgammon-bot.service';
import { GamesRealtimeService } from './games.realtime.service';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';

const mockJwt = {} as never;
const mockConfig = {} as never;

function makeCheckersState(overrides: Record<string, unknown> = {}) {
  return {
    phase: 'playing',
    options: { mode: 'standard' },
    board: [[null]],
    currentTurnIndex: 0,
    playerOrder: ['user-a', 'bot-b'],
    players: [
      { playerId: 'user-a', color: 'light', alive: true, piecesRemaining: 12 },
      { playerId: 'bot-b', color: 'dark', alive: true, piecesRemaining: 12 },
    ],
    ...overrides,
  };
}

function makeBackgammonState(overrides: Record<string, unknown> = {}) {
  return {
    phase: 'move',
    options: { mode: 'short' },
    points: [],
    bar: {},
    borneOff: {},
    dice: [3, 5],
    currentTurnIndex: 0,
    playerOrder: ['user-a', 'bot-b'],
    players: [
      {
        playerId: 'user-a',
        color: 'white',
        alive: true,
        bar: 0,
        borneOff: 0,
        pipCount: 167,
      },
      {
        playerId: 'bot-b',
        color: 'black',
        alive: true,
        bar: 0,
        borneOff: 0,
        pipCount: 167,
      },
    ],
    ...overrides,
  };
}

describe('GamesGateway – Checkers and Backgammon hints', () => {
  let gateway: GamesGateway;
  let gamesService: jest.Mocked<GamesService>;
  let sessionsService: jest.Mocked<GameSessionsService>;
  let chessBotService: jest.Mocked<ChessBotService>;
  let checkersBotService: jest.Mocked<CheckersBotService>;
  let backgammonBotService: jest.Mocked<BackgammonBotService>;
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
      gameId: 'checkers_v1',
      status: 'active',
      state: makeCheckersState(),
    };
    roomFixture = { id: 'room-1', gameOptions: {} };

    gamesService = {
      getRoom: jest.fn().mockResolvedValue(roomFixture),
    } as unknown as jest.Mocked<GamesService>;

    sessionsService = {
      getSession: jest.fn().mockResolvedValue(sessionFixture),
    } as unknown as jest.Mocked<GameSessionsService>;

    chessBotService = {
      findBestMove: jest.fn(),
    } as unknown as jest.Mocked<ChessBotService>;

    checkersBotService = {
      pickMove: jest.fn().mockReturnValue({
        steps: [{ fromRow: 2, fromCol: 1, toRow: 3, toCol: 2 }],
      }),
    } as unknown as jest.Mocked<CheckersBotService>;

    backgammonBotService = {
      pickMove: jest.fn().mockReturnValue({
        from: 24,
        to: 21,
      }),
    } as unknown as jest.Mocked<BackgammonBotService>;

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
      data: { authenticated: true, userId: 'user-a' },
    } as unknown as jest.Mocked<Socket>;

    const inert = { handlers: {} };
    gateway = new GamesGateway(
      gamesService,
      realtime,
      sessionsService,
      mockJwt,
      mockConfig,
      inert as never,
      [inert],
      chessBotService,
      checkersBotService,
      backgammonBotService,
    );
    (gateway as unknown as { server: Server }).server = server;
  });

  it('emits ok:true with serialized checkers move', async () => {
    await gateway.onRequestHint(client, {
      roomId: 'room-1',
      sessionId: 'session-1',
      userId: 'user-a',
    });

    expect(checkersBotService.pickMove).toHaveBeenCalledWith(
      expect.anything(),
      'user-a',
    );
    const checkersCall = checkersBotService.pickMove.mock.calls[0];
    const checkersArg = checkersCall
      ? (checkersCall[0] as unknown as {
          options?: { botDifficulty?: string };
        })
      : undefined;
    expect(checkersArg?.options?.botDifficulty).toBe('expert');
    expect(mockEmit).toHaveBeenCalledWith(
      'games.session.hint_result',
      maybeEncrypt({
        ok: true,
        roomId: 'room-1',
        sessionId: 'session-1',
        move: {
          gameType: 'checkers',
          from: { row: 2, col: 1 },
          to: { row: 3, col: 2 },
          steps: [{ fromRow: 2, fromCol: 1, toRow: 3, toCol: 2 }],
        },
        ts: expect.any(Number) as unknown,
      }),
    );
  });

  it('rejects checkers hint with reason not_your_turn when not player turn', async () => {
    sessionFixture.state = makeCheckersState({ currentTurnIndex: 1 });

    await gateway.onRequestHint(client, {
      roomId: 'room-1',
      sessionId: 'session-1',
      userId: 'user-a',
    });

    expect(checkersBotService.pickMove).not.toHaveBeenCalled();
    expect(mockEmit).toHaveBeenCalledWith(
      'games.session.hint_result',
      maybeEncrypt(
        expect.objectContaining({ ok: false, reason: 'not_your_turn' }),
      ),
    );
  });

  it('rejects checkers hint with reason game_over when phase is game_over', async () => {
    sessionFixture.state = makeCheckersState({ phase: 'game_over' });

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

  it('rejects checkers hint with reason no_legal_moves when pickMove returns null', async () => {
    checkersBotService.pickMove.mockReturnValueOnce(null);

    await gateway.onRequestHint(client, {
      roomId: 'room-1',
      sessionId: 'session-1',
      userId: 'user-a',
    });

    expect(mockEmit).toHaveBeenCalledWith(
      'games.session.hint_result',
      maybeEncrypt(
        expect.objectContaining({ ok: false, reason: 'no_legal_moves' }),
      ),
    );
  });

  it('emits ok:true with serialized backgammon move', async () => {
    sessionFixture.gameId = 'backgammon_v1';
    sessionFixture.state = makeBackgammonState();

    await gateway.onRequestHint(client, {
      roomId: 'room-1',
      sessionId: 'session-1',
      userId: 'user-a',
    });

    expect(backgammonBotService.pickMove).toHaveBeenCalledWith(
      expect.anything(),
      'user-a',
    );
    const bgCall = backgammonBotService.pickMove.mock.calls[0];
    const bgArg = bgCall
      ? (bgCall[0] as unknown as {
          options?: { aiDifficulty?: string };
        })
      : undefined;
    expect(bgArg?.options?.aiDifficulty).toBe('expert');
    expect(mockEmit).toHaveBeenCalledWith(
      'games.session.hint_result',
      maybeEncrypt({
        ok: true,
        roomId: 'room-1',
        sessionId: 'session-1',
        move: {
          gameType: 'backgammon',
          from: 24,
          to: 21,
        },
        ts: expect.any(Number) as unknown,
      }),
    );
  });

  it('rejects backgammon hint with reason no_legal_moves when in roll phase', async () => {
    sessionFixture.gameId = 'backgammon_v1';
    sessionFixture.state = makeBackgammonState({ phase: 'roll', dice: [] });

    await gateway.onRequestHint(client, {
      roomId: 'room-1',
      sessionId: 'session-1',
      userId: 'user-a',
    });

    expect(backgammonBotService.pickMove).not.toHaveBeenCalled();
    expect(mockEmit).toHaveBeenCalledWith(
      'games.session.hint_result',
      maybeEncrypt(
        expect.objectContaining({ ok: false, reason: 'no_legal_moves' }),
      ),
    );
  });

  it('rejects backgammon hint with reason not_your_turn when not player turn', async () => {
    sessionFixture.gameId = 'backgammon_v1';
    sessionFixture.state = makeBackgammonState({ currentTurnIndex: 1 });

    await gateway.onRequestHint(client, {
      roomId: 'room-1',
      sessionId: 'session-1',
      userId: 'user-a',
    });

    expect(backgammonBotService.pickMove).not.toHaveBeenCalled();
    expect(mockEmit).toHaveBeenCalledWith(
      'games.session.hint_result',
      maybeEncrypt(
        expect.objectContaining({ ok: false, reason: 'not_your_turn' }),
      ),
    );
  });

  it('rejects backgammon hint with reason game_over when phase is game_over', async () => {
    sessionFixture.gameId = 'backgammon_v1';
    sessionFixture.state = makeBackgammonState({ phase: 'game_over' });

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

  it('rejects backgammon hint with reason no_legal_moves when pickMove returns null', async () => {
    sessionFixture.gameId = 'backgammon_v1';
    sessionFixture.state = makeBackgammonState();
    backgammonBotService.pickMove.mockReturnValueOnce(null);

    await gateway.onRequestHint(client, {
      roomId: 'room-1',
      sessionId: 'session-1',
      userId: 'user-a',
    });

    expect(mockEmit).toHaveBeenCalledWith(
      'games.session.hint_result',
      maybeEncrypt(
        expect.objectContaining({ ok: false, reason: 'no_legal_moves' }),
      ),
    );
  });
});
