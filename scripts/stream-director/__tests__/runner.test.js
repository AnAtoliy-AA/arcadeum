'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('events');
const { StreamRunner } = require('../streamRunner');
const { createAlerter } = require('../alerts');
const { isKilled } = require('../killSwitch');
const { Health } = require('../health');
const { sanitize } = require('../log');
const { loadConfig } = require('../config');

function fakeSpawn() {
  const children = [];
  const fn = () => {
    const c = new EventEmitter();
    c.stdout = new EventEmitter();
    c.stderr = new EventEmitter();
    c.killed = [];
    c.kill = (s) => {
      c.killed.push(s);
      setImmediate(() => c.emit('exit', null, s));
    };
    children.push(c);
    return c;
  };
  return { fn, children };
}
const log = { info() {}, warn() {}, error() {} };

function mk(spawnFn, now, kind = 'rtmp') {
  const config = loadConfig(
    { STREAM_RTMP_URL: 'rtmp://h/a', STREAM_KEY: 'k' },
    [],
  );
  config.stallMs = 30000;
  return new StreamRunner({
    config,
    spawnFn,
    log,
    now,
    outputFor: () => ({ kind, target: 't', durationSec: 1 }),
  });
}

test('stall watchdog kills ffmpeg when frames stop advancing', () => {
  const { fn, children } = fakeSpawn();
  let t = 0;
  const r = mk(fn, () => t);
  r.start();
  children[0].stdout.emit('data', 'frame=10\nfps=30\n');
  t = 10000;
  assert.equal(r.checkStall(), false);
  children[0].stdout.emit('data', 'frame=11\n');
  t = 45000; // 35s since last advance
  assert.equal(r.checkStall(), true);
  assert.deepEqual(children[0].killed, ['SIGKILL']);
  assert.equal(r.lastRestartReason, 'frames stalled');
  r.stop();
});

test('restarts with growing backoff after exit', async () => {
  const { fn, children } = fakeSpawn();
  let t = 0;
  const r = mk(fn, () => t);
  const delays = [];
  r.on('restart', (e) => delays.push(e.inMs));
  r.start();
  children[0].emit('exit', 1, null);
  assert.deepEqual(delays, [1000]);
  await r.stop();
  assert.equal(children.length, 1);
});

test('dry run exit code 0 emits finished and does not restart', () => {
  const { fn, children } = fakeSpawn();
  const r = mk(fn, () => 0, 'file');
  let finished = false;
  r.on('finished', () => (finished = true));
  r.start();
  children[0].emit('exit', 0, null);
  assert.ok(finished);
});

test('alert webhook: mock fetch, cooldown, discord+text fields', async () => {
  const sent = [];
  let t = 0;
  const alert = createAlerter({
    url: 'https://hook.example/x',
    fetchFn: async (u, o) => sent.push(JSON.parse(o.body)),
    now: () => t,
  });
  assert.equal(await alert('k', 'hello'), true);
  assert.equal(await alert('k', 'again'), false);
  t = 400000;
  assert.equal(await alert('k', 'later'), true);
  assert.equal(sent[0].text, sent[0].content);
  assert.equal(await createAlerter({ url: '' })('k', 'm'), false);
});

test('kill switch: flag file or env', () => {
  assert.equal(
    isKilled({ killFile: '/k', killEnv: false }, () => true),
    true,
  );
  assert.equal(
    isKilled({ killFile: '/k', killEnv: false }, () => false),
    false,
  );
  assert.equal(
    isKilled({ killFile: '/k', killEnv: true }, () => false),
    true,
  );
});

test('health snapshot has uptime and status fields, writes the file', () => {
  let t = 0;
  let written = null;
  const h = new Health({
    now: () => t,
    statusFile: '/s.json',
    mkdir() {},
    writeFile: (f, d) => (written = JSON.parse(d)),
  });
  h.update({
    currentGame: { id: 'chess_v1' },
    ffmpegFps: 29.9,
    lastRestartReason: 'exit code 1',
  });
  t = 5000;
  const s = h.snapshot();
  assert.equal(s.uptimeSec, 5);
  assert.equal(written.currentGame.id, 'chess_v1');
  assert.equal(s.lastRestartReason, 'exit code 1');
});

test('log sanitizer redacts secret-looking keys', () => {
  const s = sanitize({ streamKey: 'x', nested: { password: 'p', ok: 1 } });
  assert.equal(s.streamKey, '[redacted]');
  assert.equal(s.nested.password, '[redacted]');
  assert.equal(s.nested.ok, 1);
});
