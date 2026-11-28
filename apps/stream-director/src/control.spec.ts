import { loadConfig } from './config';
import { ControlLoop } from './control';
import { ErrorRing, withErrorRing, redactText } from './errorRing';
import type { ControlClient } from './controlClient';
import { settings } from './remoteFixture';

const log = () => ({
  info: jest.fn(),
  warn: jest.fn<void, [string, Record<string, unknown>?]>(),
  error: jest.fn(),
});

const callsOf = (m: unknown): unknown[][] =>
  (m as jest.Mock).mock.calls as unknown[][];

function setup(client: Partial<ControlClient> = {}) {
  const config = loadConfig({}, []);
  const supervisor = {
    setRemote: jest.fn(),
    markFfmpegDirty: jest.fn(),
    skip: jest.fn(() => true),
    restartBrowser: jest.fn(() => Promise.resolve(true)),
    tick: jest.fn(() => Promise.resolve()),
  };
  const c: ControlClient = {
    fetchConfig: jest.fn(() =>
      Promise.resolve({
        kind: 'modified' as const,
        body: { version: 4, config: settings() },
        etag: '"stream-v4"',
      }),
    ),
    fetchCommands: jest.fn(() => Promise.resolve([])),
    ackCommand: jest.fn(() => Promise.resolve()),
    postStatus: jest.fn(() => Promise.resolve()),
    ...client,
  };
  const l = log();
  const ring = new ErrorRing();
  const loop = new ControlLoop({
    config,
    client: c,
    supervisor,
    health: {
      snapshot: () => ({
        state: 'live',
        currentGame: {
          id: 'chess_v1',
          roomId: 'r1',
          theme: 'zen',
          startedAt: 'now',
        },
        gamesPlayed: 3,
        lastRestartReason: null,
        lastRestartAt: null,
        ffmpegFps: 29.97,
        ffmpegFrames: 10,
        ffmpegRestarts: 1,
        dryRun: false,
        killed: false,
        uptimeSec: 120,
        updatedAt: 'x',
      }),
    },
    ring,
    log: l,
    alert: jest.fn(() => Promise.resolve(true)),
  });
  return { loop, config, supervisor, client: c, log: l, ring };
}

describe('ControlLoop config polling', () => {
  it('applies a valid config and remembers the applied version + ETag', async () => {
    const { loop, supervisor, client, config } = setup();
    await loop.pollConfig();
    expect(loop.appliedVersion).toBe(4);
    expect(supervisor.setRemote).toHaveBeenCalledWith(true, false);
    expect(config.director.games).toHaveLength(12);
    await loop.pollConfig();
    expect(client.fetchConfig).toHaveBeenLastCalledWith('"stream-v4"');
  });

  it('treats 304 as no change', async () => {
    const { loop, supervisor } = setup({
      fetchConfig: jest.fn(() =>
        Promise.resolve({ kind: 'not_modified' as const }),
      ),
    });
    await loop.pollConfig();
    expect(loop.appliedVersion).toBe(0);
    expect(supervisor.setRemote).not.toHaveBeenCalled();
    expect(loop.backendUp).toBe(true);
  });

  it('ignores invalid remote values, logs once, keeps the last good config', async () => {
    const { loop, config, log: l, client } = setup();
    await loop.pollConfig();
    const good = config.director.moveDelayMs;
    (client.fetchConfig as jest.Mock).mockResolvedValue({
      kind: 'modified',
      body: {
        version: 5,
        config: { ...settings(), bot: { difficulty: 'x', moveDelayMs: 1 } },
      },
      etag: '"stream-v5"',
    });
    await loop.pollConfig();
    await loop.pollConfig();
    expect(loop.appliedVersion).toBe(4);
    expect(config.director.moveDelayMs).toBe(good);
    const warns = l.warn.mock.calls.filter((c) =>
      c[0].includes('invalid remote config'),
    );
    expect(warns).toHaveLength(1);
  });

  it('backend down: keeps config, does not throw, recovers later', async () => {
    const { loop, config, client, log: l } = setup();
    await loop.pollConfig();
    const before = JSON.stringify(config.director.games);
    (client.fetchConfig as jest.Mock).mockRejectedValue(
      new Error('ECONNREFUSED'),
    );
    await expect(loop.poll()).resolves.toBeUndefined();
    await loop.poll();
    expect(loop.backendUp).toBe(false);
    expect(JSON.stringify(config.director.games)).toBe(before);
    expect(client.fetchCommands).not.toHaveBeenCalled();
    const outages = l.warn.mock.calls.filter((c) =>
      c[0].includes('unreachable'),
    );
    expect(outages).toHaveLength(1);
    (client.fetchConfig as jest.Mock).mockResolvedValue({
      kind: 'not_modified',
    });
    await loop.poll();
    expect(loop.backendUp).toBe(true);
  });

  it('a profile change marks ffmpeg for a restart at the next game', async () => {
    const { loop, supervisor, client } = setup();
    await loop.pollConfig();
    expect(supervisor.markFfmpegDirty).not.toHaveBeenCalled();
    (client.fetchConfig as jest.Mock).mockResolvedValue({
      kind: 'modified',
      body: {
        version: 6,
        config: settings({
          video: {
            resolution: '1080p',
            fps: 30,
            bitrateKbps: 4500,
            preset: 'veryfast',
          },
        }),
      },
      etag: '"stream-v6"',
    });
    await loop.pollConfig();
    expect(supervisor.markFfmpegDirty).toHaveBeenCalledTimes(1);
  });
});

describe('ControlLoop commands', () => {
  const withCommands = (cmds: unknown[]) =>
    setup({ fetchCommands: jest.fn(() => Promise.resolve(cmds)) });

  it('executes stop (graceful), start, skip and restart_browser, acking each', async () => {
    const { loop, supervisor, client } = withCommands([
      { id: '1', type: 'stop', graceful: true },
      { id: '2', type: 'start' },
      { id: '3', type: 'skip' },
      { id: '4', type: 'restart_browser' },
    ]);
    await loop.poll();
    expect(supervisor.setRemote).toHaveBeenCalledWith(false, true);
    expect(supervisor.setRemote).toHaveBeenCalledWith(true, false);
    expect(supervisor.skip).toHaveBeenCalled();
    expect(supervisor.restartBrowser).toHaveBeenCalled();
    expect(client.ackCommand).toHaveBeenCalledTimes(4);
    expect(callsOf(client.ackCommand).map((c) => c[1])).toEqual([
      'done',
      'done',
      'done',
      'done',
    ]);
  });

  it('acks failed when there is nothing to skip', async () => {
    const { loop, supervisor, client } = withCommands([
      { id: '9', type: 'skip' },
    ]);
    supervisor.skip.mockReturnValue(false);
    await loop.poll();
    expect(client.ackCommand).toHaveBeenCalledWith(
      '9',
      'failed',
      'no game is running',
    );
  });

  it('never executes the same command twice if the ack was lost', async () => {
    const { loop, supervisor } = withCommands([{ id: 'dup', type: 'skip' }]);
    await loop.pollCommands();
    await loop.pollCommands();
    expect(supervisor.skip).toHaveBeenCalledTimes(1);
  });

  it('ignores malformed commands from the backend', async () => {
    const { loop, supervisor, client } = withCommands([
      { id: 'x', type: 'drop_db' },
      7,
    ]);
    await loop.pollCommands();
    expect(supervisor.skip).not.toHaveBeenCalled();
    expect(client.ackCommand).not.toHaveBeenCalled();
  });

  it('a failing command poll does not throw', async () => {
    const { loop } = setup({
      fetchCommands: jest.fn(() => Promise.reject(new Error('x'))),
    });
    await expect(loop.pollCommands()).resolves.toBeUndefined();
  });
});

describe('ControlLoop status report', () => {
  it('sends only DTO fields, the applied version and recent errors', async () => {
    const { loop, client, ring } = setup();
    await loop.pollConfig();
    ring.push('ffmpeg exited: signal SIGKILL');
    await loop.report();
    const payload = callsOf(client.postStatus)[0][0] as Record<string, unknown>;
    expect(Object.keys(payload).sort()).toEqual(
      [
        'appliedConfigVersion',
        'currentGame',
        'dryRun',
        'ffmpegFps',
        'ffmpegRestarts',
        'gamesPlayed',
        'lastRestartAt',
        'lastRestartReason',
        'recentErrors',
        'state',
        'uptimeSec',
      ].sort(),
    );
    expect(payload.appliedConfigVersion).toBe(4);
    expect(payload.ffmpegFps).toBe(30);
    expect(payload.recentErrors).toHaveLength(1);
  });

  it('a failed report never throws', async () => {
    const { loop } = setup({
      postStatus: jest.fn(() => Promise.reject(new Error('down'))),
    });
    await expect(loop.report()).resolves.toBeUndefined();
  });
});

describe('error ring', () => {
  it('keeps the last N entries and redacts URLs and tokens', () => {
    const ring = new ErrorRing(3);
    for (let i = 0; i < 5; i++) ring.push(`e${i}`);
    expect(ring.list()).toHaveLength(3);
    expect(redactText('push rtmp://live.example/app/SECRETKEY failed')).toBe(
      'push [url] failed',
    );
    expect(redactText('Bearer abc.def token=zzz')).toBe(
      'bearer [redacted] token=[redacted]',
    );
  });

  it('captures warn and error but not info', () => {
    const ring = new ErrorRing();
    const l = withErrorRing(log(), ring);
    l.info('fine');
    l.warn('careful', { error: 'boom' });
    l.error('bad');
    expect(ring.list()).toHaveLength(2);
    expect(ring.list()[0]).toContain('careful: boom');
  });
});
