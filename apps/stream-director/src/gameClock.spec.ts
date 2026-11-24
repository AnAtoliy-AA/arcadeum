import { evaluateGame, isCompleted, sessionSignature } from './gameClock';
import { Director } from './director';
import { loadConfig } from './config';
import type {
  DirectorApi,
  GameConfig,
  RoomInfoResponse,
  StreamConfig,
} from './types';

const base = {
  now: 1000,
  startedAt: 0,
  maxDurationMs: 5000,
  stuckMs: 2000,
  lastChangeAt: 0,
};

describe('evaluateGame', () => {
  it('returns the right verdicts', () => {
    expect(evaluateGame({ ...base, completed: true }).verdict).toBe('finished');
    expect(evaluateGame(base).verdict).toBe('continue');
    expect(
      evaluateGame({ ...base, now: 5000, lastChangeAt: 4999 }).verdict,
    ).toBe('timeout');
    expect(evaluateGame({ ...base, now: 2500 }).verdict).toBe('stuck');
    expect(evaluateGame({ ...base, consecutiveErrors: 5 }).verdict).toBe(
      'error',
    );
  });

  it('max duration beats a game that keeps making progress', () => {
    expect(
      evaluateGame({ ...base, now: 9000, lastChangeAt: 8999 }).verdict,
    ).toBe('timeout');
  });

  it('detects completion and signatures', () => {
    expect(isCompleted({ room: { id: 'r', status: 'completed' } })).toBe(true);
    expect(isCompleted({ session: { status: 'completed' } })).toBe(true);
    expect(
      isCompleted({
        room: { id: 'r', status: 'in_progress' },
        session: { status: 'active' },
      }),
    ).toBe(false);
    expect(sessionSignature({ updatedAt: 'a' })).not.toBe(
      sessionSignature({ updatedAt: 'b' }),
    );
    expect(sessionSignature(null)).toBe('none');
  });
});

const game: GameConfig = {
  id: 'g_v1',
  title: 'G',
  maxDurationMs: 10_000,
  stuckMs: 4000,
  moveDelayMs: 2000,
  themes: ['x'],
  personalities: null,
};

function harness(info: (t: number) => RoomInfoResponse) {
  let t = 0;
  const abandoned: string[] = [];
  const config: StreamConfig = loadConfig({}, []);
  config.director.pollMs = 1000;
  config.director.games = [game, { ...game, id: 'other_v1' }];
  const api: DirectorApi = {
    createAiVsAi: () => Promise.resolve({ id: 'room1' }),
    getRoomInfo: () => Promise.resolve(info(t)),
    abandonRoom: (id) => {
      abandoned.push(id);
      return Promise.resolve(true);
    },
  };
  const log = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const director = new Director({
    config,
    api,
    browser: {
      goto: () => Promise.resolve(),
      recycle: () => Promise.resolve(),
    },
    health: { update: jest.fn() },
    log,
    now: () => t,
    wait: (ms) => {
      t += ms;
      return Promise.resolve();
    },
    rng: () => 0.1,
  });
  return { director, abandoned, time: () => t };
}

describe('Director game lifecycle', () => {
  it('forces a skip when a game never ends (max duration)', async () => {
    // State changes every poll so it is never "stuck", but never completes.
    const { director, abandoned, time } = harness((t) => ({
      session: { status: 'active', updatedAt: String(t) },
    }));
    const out = await director.playOne();
    expect(out.verdict).toBe('timeout');
    expect(abandoned).toEqual(['room1']);
    expect(time()).toBeLessThanOrEqual(11_000);
    expect(director.last?.result).toBe('Time limit reached');
  });

  it('abandons a stuck room (no state change) early', async () => {
    const { director, abandoned, time } = harness(() => ({
      session: { status: 'active', updatedAt: 'same' },
    }));
    const out = await director.playOne();
    expect(out.verdict).toBe('stuck');
    expect(abandoned).toHaveLength(1);
    expect(time()).toBeLessThan(game.maxDurationMs);
  });

  it('ends with verdict error when the BE keeps failing', async () => {
    const { director, abandoned } = harness(() => {
      throw new Error('boom');
    });
    const out = await director.playOne();
    expect(out.verdict).toBe('error');
    expect(abandoned).toHaveLength(1);
  });

  it('does not abandon a game that completes normally', async () => {
    const { director, abandoned } = harness((t) => ({
      room: { id: 'room1', status: t >= 3000 ? 'completed' : 'in_progress' },
      session: { updatedAt: String(t) },
    }));
    const out = await director.playOne();
    expect(out.verdict).toBe('finished');
    expect(abandoned).toHaveLength(0);
    expect(director.last?.result).toBe('Game complete');
  });
});
