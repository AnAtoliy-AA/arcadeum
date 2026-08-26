import { GamesGateway } from './games.gateway';
import { HeartsGateway } from './hearts.gateway';
import { HeartsService } from './hearts/hearts.service';
import { SpadesGateway } from './spades.gateway';
import { SpadesService } from './spades/spades.service';
import type { Server, Socket } from 'socket.io';

/**
 * Regression guard for the central game-event dispatcher: every gateway
 * wired into GamesGateway must actually receive its socket events.
 *
 * Hearts was shipped with a provider in games.module.ts but never injected
 * into GamesGateway, so every `hearts.session.*` event was silently dropped
 * (unknown event → no handler → no reply) and Start Game did nothing.
 */
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

  const flush = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
  };

  function buildGateway(): {
    dispatch: (event: string, payload: Record<string, unknown>) => void;
  } {
    const heartsHandler = new HeartsGateway(
      heartsServiceStub as unknown as HeartsService,
    );
    const spadesHandler = new SpadesGateway(
      spadesServiceStub as unknown as SpadesService,
    );

    // Inert stand-ins for the other games' gateways (checkers,
    // tic-tac-toe, chess, cascade, cat-dash, texas-holdem, critical,
    // critical-actions, sea-battle, glimworm, backgammon); only wiring
    // order and presence matter here.
    const inert = { handlers: {} };
    const gateway = new GamesGateway(
      {} as never,
      { registerServer: jest.fn() } as never,
      {} as never,
      {} as never,
      { get: () => undefined } as never,
      {} as never,
      inert as never,
      inert as never,
      inert as never,
      inert as never,
      inert as never,
      inert as never,
      inert as never,
      inert as never,
      inert as never,
      inert as never,
      inert as never,
      heartsHandler,
      spadesHandler,
      inert as never,
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

  it('does not route unknown events', async () => {
    const { dispatch } = buildGateway();

    dispatch('unknown.session.start', { roomId: 'room-1', userId: 'user-1' });
    await flush();

    expect(heartsServiceStub.startSession).not.toHaveBeenCalled();
    expect(spadesServiceStub.startSession).not.toHaveBeenCalled();
  });
});
