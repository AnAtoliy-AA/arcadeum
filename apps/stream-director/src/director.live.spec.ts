import { Director, sceneUrl } from './director';
import { loadConfig } from './config';
import type { DirectorApi, GameConfig, RoomInfoResponse } from './types';

const game = (id: string, over: Partial<GameConfig> = {}): GameConfig => ({
  id,
  title: id,
  maxDurationMs: 600_000,
  stuckMs: 600_000,
  moveDelayMs: 2000,
  weight: 1,
  themes: ['zen'],
  personalities: null,
  ...over,
});

function harness(
  info: (t: number) => RoomInfoResponse = (t) => ({
    session: { updatedAt: String(t) },
  }),
) {
  let t = 0;
  const config = loadConfig({}, []);
  config.director.pollMs = 1000;
  config.director.games = [game('a_v1'), game('b_v1')];
  const created: {
    gameId: string;
    botDifficulty?: string | null;
    moveDelayMs: number;
  }[] = [];
  const abandoned: string[] = [];
  const urls: string[] = [];
  const api: DirectorApi = {
    createAiVsAi: (a) => {
      created.push(a);
      return Promise.resolve({ id: `room${created.length}` });
    },
    getRoomInfo: () => Promise.resolve(info(t)),
    abandonRoom: (id) => {
      abandoned.push(id);
      return Promise.resolve(true);
    },
  };
  const recycle = jest.fn(() => Promise.resolve());
  const hooks: { onWait: (() => void) | null } = { onWait: null };
  const director = new Director({
    config,
    api,
    browser: { goto: (u) => (urls.push(u), Promise.resolve()), recycle },
    health: { update: jest.fn() },
    log: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    alert: jest.fn(() => Promise.resolve(true)),
    now: () => t,
    wait: (ms) => {
      t += ms;
      hooks.onWait?.();
      return Promise.resolve();
    },
    rng: () => 0.1,
  });
  return {
    director,
    config,
    created,
    abandoned,
    urls,
    recycle,
    hooks,
    time: () => t,
  };
}

describe('Director admin controls', () => {
  it('skipCurrent ends the running game and abandons the room without counting a failure', async () => {
    const h = harness();
    // The admin skips while the game is in progress (first poll wait).
    h.hooks.onWait = () => h.director.skipCurrent();
    const out = await h.director.playOne();
    expect(out.verdict).toBe('skipped');
    expect(h.abandoned).toEqual(['room1']);
    expect(h.director.consecutiveFailures).toBe(0);
    expect(h.director.last?.result).toBe('Game skipped');
  });

  it('inGame is true only while a room is being watched', async () => {
    const h = harness((t) => ({
      room: { id: 'r', status: t >= 2000 ? 'completed' : 'active' },
      session: { updatedAt: String(t) },
    }));
    expect(h.director.inGame).toBe(false);
    await h.director.playOne();
    expect(h.director.inGame).toBe(false);
  });

  it('uses the live difficulty and move delay for the next room', async () => {
    const h = harness((t) => ({
      room: { id: 'r', status: 'completed' },
      session: { updatedAt: String(t) },
    }));
    h.config.director.botDifficulty = 'medium';
    h.config.director.moveDelayMs = 3500;
    await h.director.playOne();
    expect(h.created[0]).toMatchObject({
      botDifficulty: 'medium',
      moveDelayMs: 3500,
    });
  });

  it('applies a shorter max duration to the game that is already running', async () => {
    const h = harness();
    const play = h.director.playOne();
    await Promise.resolve();
    h.config.director.games = [
      game('a_v1', { maxDurationMs: 5000 }),
      game('b_v1', { maxDurationMs: 5000 }),
    ];
    const out = await play;
    expect(out.verdict).toBe('timeout');
    expect(h.time()).toBeLessThanOrEqual(7000);
  });

  it('a live game-list change reaches the rotation before the next pick', async () => {
    const h = harness((t) => ({
      room: { id: 'r', status: 'completed' },
      session: { updatedAt: String(t) },
    }));
    await h.director.playOne();
    h.config.director.games = [game('x_v1'), game('y_v1')];
    for (let i = 0; i < 6; i++) await h.director.playOne();
    expect(
      h.created.slice(1).every((c) => ['x_v1', 'y_v1'].includes(c.gameId)),
    ).toBe(true);
  });

  it('graceful stop: finishes the game, then drains without starting another', async () => {
    const h = harness((t) => ({
      room: { id: 'r', status: t >= 3000 ? 'completed' : 'active' },
      session: { updatedAt: String(t) },
    }));
    const drained = jest.fn();
    h.director.onDrained = drained;
    h.hooks.onWait = () => h.director.requestStopAfterGame();
    await h.director.run();
    expect(drained).toHaveBeenCalledTimes(1);
    expect(h.created).toHaveLength(1);
    expect(h.abandoned).toHaveLength(0);
    expect(h.director.stopped).toBe(true);
  });

  it('runs the boundary hook during the idle scene', async () => {
    let calls = 0;
    const h = harness((t) => ({
      room: { id: 'r', status: 'completed' },
      session: { updatedAt: String(t) },
    }));
    h.director.onBoundary = () => {
      calls += 1;
      h.director.stop();
      return Promise.resolve();
    };
    await h.director.run();
    expect(calls).toBe(1);
  });

  it('restartBrowser recycles Chromium and returns to the current scene', async () => {
    const h = harness((t) => ({
      room: { id: 'r', status: 'completed' },
      session: { updatedAt: String(t) },
    }));
    await h.director.playOne();
    const before = h.urls.length;
    const last = h.urls[before - 1];
    await h.director.restartBrowser();
    expect(h.recycle).toHaveBeenCalled();
    expect(h.urls[before]).toBe(last);
  });
});

describe('sceneUrl overlay params', () => {
  const base = { web: { baseUrl: 'http://w', locale: 'en' } };

  it('adds nothing by default', () => {
    expect(sceneUrl(base, 'r1', { lang: 'en' })).toBe(
      'http://w/en/stream/r1?lang=en',
    );
  });

  it('adds join, qr, banner and hide when set', () => {
    const url = sceneUrl(
      {
        ...base,
        scene: {
          overlay: {
            joinUrl: 'https://x.test',
            showQr: false,
            banner: 'Hi there',
            hide: ['players', 'cta'],
          },
        },
      },
      null,
      { next: 'chess_v1' },
    );
    const q = new URL(url).searchParams;
    expect(q.get('join')).toBe('https://x.test');
    expect(q.get('qr')).toBe('0');
    expect(q.get('banner')).toBe('Hi there');
    expect(q.get('hide')).toBe('players,cta');
    expect(q.get('next')).toBe('chess_v1');
  });
});
