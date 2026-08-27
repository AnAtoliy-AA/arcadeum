import { GamesGateway } from './games.gateway';
import { HeartsGateway } from './hearts.gateway';
import { HeartsService } from './hearts/hearts.service';
import { SpadesGateway } from './spades.gateway';
import { SpadesService } from './spades/spades.service';
import { PachisiGateway } from './pachisi.gateway';
import { PachisiService } from './pachisi/pachisi.service';
import { CheckersGateway } from './checkers.gateway';
import { TicTacToeGateway } from './tic-tac-toe.gateway';
import { ChessGateway } from './chess.gateway';
import { CascadeGateway } from './cascade.gateway';
import { CatDashGateway } from './cat-dash.gateway';
import { TexasHoldemGateway } from './texas-holdem.gateway';
import { CriticalGateway } from './critical.gateway';
import { CriticalActionsGateway } from './critical-actions.gateway';
import { SeaBattleGateway } from './sea-battle.gateway';
import { GlimwormGateway } from './glimworm.gateway';
import type { GameVisibilityService } from '../admin/game-visibility/game-visibility.service';
import type { UserRoleResolver } from '../auth/lib/user-role-resolver.service';
import { BackgammonGateway } from './backgammon.gateway';
import { GoGateway } from './go.gateway';
import { GAME_CATALOG, type GameCatalogEntry } from './games.catalog';
import type { GameMessageHandler } from './game-message-handler.interface';

// Compile-time guard: forces EXPECTED_START_EVENT to be kept in sync with GAME_CATALOG.
// If you add a new game to the catalog without updating the map below, your build will fail.
type GameId = GameCatalogEntry['gameId'];
type ExpectedStartEvents = Record<GameId, string>;
import type { Server, Socket } from 'socket.io';

/**
 * Regression guard for the central game-event dispatcher: every gateway
 * wired into GamesGateway must actually receive its socket events.
 *
 * Hearts and later Pachisi were shipped with a provider in games.module.ts
 * but never injected into GamesGateway, so every `<game>.session.*` event
 * was silently dropped (unknown event → no handler → no reply) and Start
 * Game did nothing. The catalog coverage test below fails when a game is
 * added to GAME_CATALOG without being wired into the dispatcher.
 */

const EXPECTED_START_EVENT: ExpectedStartEvents = {
  critical_v1: 'games.session.start',
  sea_battle_v1: 'seaBattle.session.start',
  texas_holdem_v1: 'games.session.start_holdem',
  glimworm_v1: 'glimworm.start',
  tic_tac_toe_v1: 'ticTacToe.session.start',
  cascade_v1: 'cascade.session.start',
  chess_v1: 'chess.session.start',
  checkers_v1: 'checkers.session.start',
  cat_dash_v1: 'catDash.session.start',
  backgammon_v1: 'backgammon.session.start',
  hearts_v1: 'hearts.session.start',
  spades_v1: 'spades.session.start',
  go_v1: 'go.session.start',
  pachisi_v1: 'pachisi.session.start',
};

describe('GamesGateway game handler registration', () => {
  const heartsServiceStub = {
    startSession: jest.fn().mockResolvedValue({ sessionId: 's1' }),
    passCards: jest.fn().mockResolvedValue({}),
    playCard: jest.fn().mockResolvedValue({}),
    forfeit: jest.fn().mockResolvedValue({}),
  };

  const spadesServiceStub = {
    startSession: jest.fn().mockResolvedValue({ sessionId: 's1' }),
    bid: jest.fn().mockResolvedValue({}),
    playCard: jest.fn().mockResolvedValue({}),
    forfeit: jest.fn().mockResolvedValue({}),
  };

  const pachisiServiceStub = {
    startSession: jest.fn().mockResolvedValue({ sessionId: 's1' }),
    rollDice: jest.fn().mockResolvedValue({}),
    moveToken: jest.fn().mockResolvedValue({}),
    forfeit: jest.fn().mockResolvedValue({}),
  };

  const flush = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
  };

  function buildGateway(handlers: GameMessageHandler[] = []): {
    dispatch: (event: string, payload: Record<string, unknown>) => void;
  } {
    const heartsHandler = new HeartsGateway(
      heartsServiceStub as unknown as HeartsService,
    );
    const spadesHandler = new SpadesGateway(
      spadesServiceStub as unknown as SpadesService,
    );
    const pachisiHandler = new PachisiGateway(
      pachisiServiceStub as unknown as PachisiService,
    );

    const gateway = new GamesGateway(
      {} as never,
      { registerServer: jest.fn() } as never,
      {} as never,
      {} as never,
      { get: () => undefined } as never,
      {} as never,
      [...handlers, heartsHandler, spadesHandler, pachisiHandler],
    );

    type ConnectionHandler = (socket: Socket) => void;
    const connectionHandlers: ConnectionHandler[] = [];
    const fakeServer = {
      on: (event: string, cb: ConnectionHandler) => {
        if (event === 'connection') connectionHandlers.push(cb);
      },
    } as unknown as Server;
    (gateway as unknown as { server: Server }).server = fakeServer;

    gateway.afterInit();

    const connectionCb = connectionHandlers[0];
    if (!connectionCb) throw new Error('server.on("connection") not wired');

    type AnyEventHandler = (event: string, payload: unknown) => void;
    let registered: AnyEventHandler | undefined;
    const fakeSocket = {
      onAny: (cb: AnyEventHandler) => {
        registered = cb;
      },
      // Identity checks fail closed — sockets must present a verified id.
      data: { authenticated: true, userId: 'user-1' },
    } as unknown as Socket;
    connectionCb(fakeSocket);
    if (!registered) throw new Error('socket.onAny not wired');
    const registeredHandler = registered;

    return {
      dispatch: (event, payload) => registeredHandler(event, payload),
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('routes hearts.session.start to the Hearts service', async () => {
    const { dispatch } = buildGateway();

    dispatch('hearts.session.start', { roomId: 'room-1', userId: 'user-1' });
    await flush();

    expect(heartsServiceStub.startSession).toHaveBeenCalledWith(
      'user-1',
      'room-1',
      false,
      undefined,
    );
  });

  it('routes hearts.game actions to the Hearts service', async () => {
    const { dispatch } = buildGateway();

    dispatch('hearts.session.pass_cards', {
      roomId: 'room-1',
      userId: 'user-1',
      cards: ['2C', '3C', '4C'],
    });
    dispatch('hearts.session.play_card', {
      roomId: 'room-1',
      userId: 'user-1',
      card: '2C',
    });
    await flush();

    expect(heartsServiceStub.passCards).toHaveBeenCalled();
    expect(heartsServiceStub.playCard).toHaveBeenCalled();
  });

  it('routes spades.session.start to the Spades service', async () => {
    const { dispatch } = buildGateway();

    dispatch('spades.session.start', { roomId: 'room-1', userId: 'user-1' });
    await flush();

    expect(spadesServiceStub.startSession).toHaveBeenCalledWith(
      'user-1',
      'room-1',
      false,
      undefined,
    );
  });

  it('routes pachisi.session.start to the Pachisi service with bot flags', async () => {
    const { dispatch } = buildGateway();

    dispatch('pachisi.session.start', {
      roomId: 'room-1',
      userId: 'user-1',
      withBots: true,
      botCount: 2,
    });
    await flush();

    expect(pachisiServiceStub.startSession).toHaveBeenCalledWith(
      'user-1',
      'room-1',
      true,
      2,
    );
  });

  it('does not route unknown events', async () => {
    const { dispatch } = buildGateway();

    dispatch('unknown.session.start', { roomId: 'room-1', userId: 'user-1' });
    await flush();

    expect(heartsServiceStub.startSession).not.toHaveBeenCalled();
    expect(spadesServiceStub.startSession).not.toHaveBeenCalled();
    expect(pachisiServiceStub.startSession).not.toHaveBeenCalled();
  });
});

describe('GamesGateway covers every catalog game', () => {
  function buildFullRegistry(): Set<string> {
    const inert = {} as never;
    const handlers = [
      new CheckersGateway(inert),
      new TicTacToeGateway(inert),
      new ChessGateway(inert),
      new CascadeGateway(inert),
      new CatDashGateway(inert),
      new TexasHoldemGateway(inert, inert),
      new CriticalGateway(inert),
      new CriticalActionsGateway(inert, inert),
      new SeaBattleGateway(inert, inert, inert, inert),
      new GlimwormGateway(
        inert,
        {} as unknown as GameVisibilityService,
        {} as unknown as UserRoleResolver,
      ),
      new BackgammonGateway(inert),
      new HeartsGateway(inert),
      new SpadesGateway(inert),
      new GoGateway(inert),
      new PachisiGateway(inert),
    ];

    const events = new Set<string>();
    for (const handler of handlers) {
      for (const event of Object.keys(handler.handlers)) {
        events.add(event);
      }
    }
    return events;
  }

  it('expects a start event for every gameId in the catalog', () => {
    for (const entry of GAME_CATALOG) {
      expect(EXPECTED_START_EVENT[entry.gameId]).toBeDefined();
    }
  });

  it('registers the start event of every catalog game', () => {
    const registry = buildFullRegistry();

    for (const entry of GAME_CATALOG) {
      const startEvent = EXPECTED_START_EVENT[entry.gameId];
      expect(registry.has(startEvent)).toBe(true);
    }
  });
});
