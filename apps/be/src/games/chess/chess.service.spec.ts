import { ChessService } from './chess.service';
import { ChessEngine } from '../engines/chess/chess.engine';
import type { ChessState } from '../engines/chess/chess.types';
import type { GameSessionSummary } from '../sessions/game-sessions.service';

function makeService(stockfishReady = false) {
  const realtime = {
    emitToRoom: jest.fn(),
    emitToSpectators: jest.fn(),
    emitSessionSnapshot: jest.fn().mockResolvedValue(undefined),
    getSocketServer: jest.fn().mockReturnValue(null),
  };
  const stockfish = {
    isReady: jest.fn().mockReturnValue(stockfishReady),
    analyzePositionMultiPV: jest.fn().mockResolvedValue({
      cp: 10,
      mate: null,
      pv: [],
      depth: 12,
      selDepth: 12,
      nodes: 1,
      nps: 1,
      timeMs: 1,
      alternatives: [],
    }),
  };
  const bot = { setMoveFn: jest.fn(), checkAndPlay: jest.fn() };
  const service = new ChessService(
    {} as never,
    { sanitizeSummaryForPlayer: jest.fn() } as never,
    realtime as never,
    bot as never,
    stockfish as never,
    null,
    {} as never,
    null,
  );
  const runAction = jest
    .spyOn(
      service as unknown as { runAction: () => Promise<unknown> },
      'runAction',
    )
    .mockResolvedValue({});
  return { service, realtime, stockfish, runAction };
}

const engine = new ChessEngine();
const ctx = (userId: string) => ({
  userId,
  roomId: 'r1',
  sessionId: 's1',
  timestamp: new Date(),
});

function timedState(): ChessState {
  return engine.initializeState(['w', 'b'], {
    timeControl: { type: 'blitz', initialSeconds: 60, incrementSeconds: 0 },
  });
}

const session = (state: ChessState): GameSessionSummary =>
  ({
    id: 's1',
    roomId: 'r1',
    status: 'active',
    state,
    createdAt: new Date().toISOString(),
  }) as unknown as GameSessionSummary;

const check = (service: ChessService, s: GameSessionSummary) =>
  (
    service as unknown as {
      checkClockTimeout: (x: GameSessionSummary) => Promise<void>;
    }
  ).checkClockTimeout(s);

describe('ChessService clock flag handling', () => {
  it('aborts when white never makes a first move', async () => {
    const { service, runAction } = makeService();
    const state = timedState();
    state.gameCreatedAt = Date.now() - 200_000;
    await check(service, session(state));
    expect(runAction).toHaveBeenCalledWith('w', 'r1', 'abort', {});
  });

  it('aborts when black flags before its first move', async () => {
    const { service, runAction } = makeService();
    let state = timedState();
    state = engine.executeAction(state, 'move', ctx('w'), {
      fromFile: 'e',
      fromRank: 2,
      toFile: 'e',
      toRank: 4,
    }).state!;
    state.clocks!.white.lastMoveTimestamp = Date.now() - 120_000;
    await check(service, session(state));
    expect(runAction).toHaveBeenCalledWith('b', 'r1', 'abort', {});
  });

  it('issues a timeout once both sides have moved', async () => {
    const { service, runAction } = makeService();
    let state = timedState();
    state = engine.executeAction(state, 'move', ctx('w'), {
      fromFile: 'e',
      fromRank: 2,
      toFile: 'e',
      toRank: 4,
    }).state!;
    state = engine.executeAction(state, 'move', ctx('b'), {
      fromFile: 'e',
      fromRank: 7,
      toFile: 'e',
      toRank: 5,
    }).state!;
    state.clocks!.black.lastMoveTimestamp = Date.now() - 120_000;
    await check(service, session(state));
    expect(runAction).toHaveBeenCalledWith('w', 'r1', 'timeout', {});
  });

  it('does nothing while time remains', async () => {
    const { service, runAction } = makeService();
    const state = timedState();
    await check(service, session(state));
    expect(runAction).not.toHaveBeenCalled();
  });
});

describe('ChessService analysis broadcast (fair play)', () => {
  const flush = () => new Promise((r) => setImmediate(r));

  it('only sends engine analysis to spectators while the game is running', async () => {
    const { service, realtime } = makeService(true);
    const state = engine.executeAction(timedState(), 'move', ctx('w'), {
      fromFile: 'e',
      fromRank: 2,
      toFile: 'e',
      toRank: 4,
    }).state!;
    await service['emitSessionUpdate'](session(state));
    await flush();
    expect(realtime.emitToSpectators).toHaveBeenCalledWith(
      'r1',
      'chess.session.analyzed',
      expect.anything(),
    );
    expect(realtime.emitToRoom).not.toHaveBeenCalledWith(
      'r1',
      'chess.session.analyzed',
      expect.anything(),
    );
  });

  it('sends analysis to the players once the game is over', async () => {
    const { service, realtime } = makeService(true);
    let state = engine.executeAction(timedState(), 'move', ctx('w'), {
      fromFile: 'e',
      fromRank: 2,
      toFile: 'e',
      toRank: 4,
    }).state!;
    state = engine.executeAction(state, 'resign', ctx('b')).state!;
    await service['emitSessionUpdate'](session(state));
    await flush();
    expect(realtime.emitToRoom).toHaveBeenCalledWith(
      'r1',
      'chess.session.analyzed',
      expect.anything(),
    );
  });
});
