import type { Socket } from 'socket.io';
import { ChessGateway } from './chess.gateway';
import type { ChessService } from './chess/chess.service';
import type { ChessStockfishService } from './chess/engine/chess-stockfish.service';

const makeService = () =>
  ({
    move: jest.fn().mockResolvedValue({}),
    forfeit: jest.fn().mockResolvedValue({}),
    drawOffer: jest.fn().mockResolvedValue({}),
    drawAccept: jest.fn().mockResolvedValue({}),
    drawDecline: jest.fn().mockResolvedValue({}),
    takebackOffer: jest.fn().mockResolvedValue({}),
    takebackAccept: jest.fn().mockResolvedValue({}),
    takebackDecline: jest.fn().mockResolvedValue({}),
    abort: jest.fn().mockResolvedValue({}),
  }) as unknown as ChessService & { abort: jest.Mock } & Record<
      string,
      jest.Mock
    >;

const makeSocket = () =>
  ({
    id: 'sock-1',
    emit: jest.fn(),
    data: { authenticated: true, userId: 'u1' },
  }) as unknown as Socket & { emit: jest.Mock };

describe('ChessGateway offer handlers', () => {
  const gateways: ChessGateway[] = [];
  const build = (service: ChessService) => {
    const gw = new ChessGateway(service, {} as ChessStockfishService);
    gateways.push(gw);
    return gw;
  };
  afterEach(() =>
    gateways.splice(0).forEach((g) => g['rateLimiter'].destroy()),
  );

  const cases: [string, string, string][] = [
    [
      'chess.session.draw_decline',
      'drawDecline',
      'chess.session.draw_declined',
    ],
    [
      'chess.session.takeback_offer',
      'takebackOffer',
      'chess.session.takeback_offered',
    ],
    [
      'chess.session.takeback_accept',
      'takebackAccept',
      'chess.session.takeback_accepted',
    ],
    [
      'chess.session.takeback_decline',
      'takebackDecline',
      'chess.session.takeback_declined',
    ],
    ['chess.session.abort', 'abort', 'chess.session.aborted'],
  ];

  it.each(cases)(
    '%s calls ChessService.%s and acks',
    async (event, method, ack) => {
      const service = makeService();
      const gw = build(service);
      const handler = gw['getGameHandlers']()[event];
      expect(handler).toBeDefined();
      const socket = makeSocket();
      await handler(socket, { roomId: 'r1', userId: 'u1' });
      expect(service[method]).toHaveBeenCalledWith('u1', 'r1');
      expect(socket.emit).toHaveBeenCalledWith(ack, expect.anything());
    },
  );

  it('does not ack when the service rejects the action', async () => {
    const service = makeService();
    service.abort.mockRejectedValue(new Error('Invalid action'));
    const gw = build(service);
    const socket = makeSocket();
    await Promise.resolve(
      gw['getGameHandlers']()['chess.session.abort'](socket, {
        roomId: 'r1',
        userId: 'u1',
      }),
    ).catch(() => undefined);
    expect(socket.emit).not.toHaveBeenCalledWith(
      'chess.session.aborted',
      expect.anything(),
    );
  });
});
