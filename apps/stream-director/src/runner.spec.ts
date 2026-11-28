import { EventEmitter } from 'events';
import type { ChildProcess } from 'child_process';
import { StreamRunner } from './streamRunner';
import type { SpawnFn } from './streamRunner';
import { createAlerter } from './alerts';
import { isKilled } from './killSwitch';
import { Health } from './health';
import { sanitize } from './log';
import { loadConfig } from './config';
import type { FfmpegOutput } from './types';

class FakeChild extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
  killed: string[] = [];
  kill(sig: string): boolean {
    this.killed.push(sig);
    setImmediate(() => this.emit('exit', null, sig));
    return true;
  }
}

function fakeSpawn(): { fn: SpawnFn; children: FakeChild[] } {
  const children: FakeChild[] = [];
  const fn: SpawnFn = () => {
    const c = new FakeChild();
    children.push(c);
    return c as unknown as ChildProcess; // test double for the ChildProcess surface we use
  };
  return { fn, children };
}

const log = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

function mk(
  spawnFn: SpawnFn,
  now: () => number,
  kind: FfmpegOutput['kind'] = 'rtmp',
) {
  const config = loadConfig(
    { STREAM_RTMP_URL: 'rtmp://h/a', STREAM_KEY: 'k' },
    [],
  );
  config.stallMs = 30000;
  const output: FfmpegOutput =
    kind === 'rtmp'
      ? { kind: 'rtmp', target: 't' }
      : kind === 'file'
        ? { kind: 'file', path: 'x.mp4', durationSec: 1 }
        : { kind: 'null' };
  return new StreamRunner({
    config,
    spawnFn,
    log,
    now,
    outputFor: () => output,
  });
}

describe('StreamRunner', () => {
  it('kills ffmpeg when frames stop advancing (stall watchdog)', async () => {
    const { fn, children } = fakeSpawn();
    let t = 0;
    const r = mk(fn, () => t);
    r.start();
    children[0].stdout.emit('data', 'frame=10\nfps=30\n');
    t = 10000;
    expect(r.checkStall()).toBe(false);
    children[0].stdout.emit('data', 'frame=11\n');
    t = 45000; // 35s since last advance
    expect(r.checkStall()).toBe(true);
    expect(children[0].killed).toEqual(['SIGKILL']);
    expect(r.lastRestartReason).toBe('frames stalled');
    await r.stop();
  });

  it('restarts with backoff after an exit', async () => {
    const { fn, children } = fakeSpawn();
    const r = mk(fn, () => 0);
    const delays: number[] = [];
    r.on('restart', (e: { inMs: number }) => delays.push(e.inMs));
    r.start();
    children[0].emit('exit', 1, null);
    expect(delays).toEqual([1000]);
    await r.stop();
    expect(children).toHaveLength(1);
  });

  it('emits finished (no restart) when a dry run exits cleanly', () => {
    const { fn, children } = fakeSpawn();
    const r = mk(fn, () => 0, 'file');
    const finished = jest.fn();
    r.on('finished', finished);
    r.start();
    children[0].emit('exit', 0, null);
    expect(finished).toHaveBeenCalled();
  });
});

describe('StreamRunner restart', () => {
  it('restarts cleanly on request without counting a failure or backoff', async () => {
    const { fn, children } = fakeSpawn();
    const r = mk(fn, () => 0);
    r.start();
    await r.restart('settings changed');
    expect(children).toHaveLength(2);
    expect(children[0].killed).toEqual(['SIGINT']);
    expect(r.restarts).toBe(0);
    await r.stop();
  });
});

describe('ops helpers', () => {
  it('alert webhook: cooldown, discord + text fields, noop without url', async () => {
    const sent: Array<Record<string, unknown>> = [];
    let t = 0;
    const alert = createAlerter({
      url: 'https://hook.example/x',
      fetchFn: (_u, init) => {
        sent.push(JSON.parse(init.body) as Record<string, unknown>);
        return Promise.resolve();
      },
      now: () => t,
    });
    expect(await alert('k', 'hello')).toBe(true);
    expect(await alert('k', 'again')).toBe(false);
    t = 400000;
    expect(await alert('k', 'later')).toBe(true);
    expect(sent[0].text).toBe(sent[0].content);
    expect(await createAlerter({ url: '' })('k', 'm')).toBe(false);
  });

  it('kill switch: flag file or env', () => {
    expect(isKilled({ killFile: '/k', killEnv: false }, () => true)).toBe(true);
    expect(isKilled({ killFile: '/k', killEnv: false }, () => false)).toBe(
      false,
    );
    expect(isKilled({ killFile: '/k', killEnv: true }, () => false)).toBe(true);
  });

  it('health snapshot has uptime and status fields and writes the file', () => {
    let t = 0;
    let written: { currentGame: { id: string } } | null = null;
    const h = new Health({
      now: () => t,
      statusFile: '/s.json',
      mkdir: () => undefined,
      writeFile: (_f, d) => {
        written = JSON.parse(d) as { currentGame: { id: string } };
      },
    });
    h.update({
      currentGame: { id: 'chess_v1' },
      ffmpegFps: 29.9,
      lastRestartReason: 'exit code 1',
    });
    t = 5000;
    const s = h.snapshot();
    expect(s.uptimeSec).toBe(5);
    expect(written).not.toBeNull();
    expect(
      (written as unknown as { currentGame: { id: string } }).currentGame.id,
    ).toBe('chess_v1');
    expect(s.lastRestartReason).toBe('exit code 1');
  });

  it('log sanitizer redacts secret-looking keys', () => {
    const s = sanitize({
      streamKey: 'x',
      nested: { password: 'p', ok: 1 },
    }) as {
      streamKey: string;
      nested: { password: string; ok: number };
    };
    expect(s.streamKey).toBe('[redacted]');
    expect(s.nested.password).toBe('[redacted]');
    expect(s.nested.ok).toBe(1);
  });
});
