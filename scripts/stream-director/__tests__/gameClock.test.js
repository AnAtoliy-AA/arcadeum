'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateGame, sessionSignature, isCompleted } = require('../gameClock');
const { Director } = require('../director');
const { loadConfig } = require('../config');

const base = {
  now: 1000,
  startedAt: 0,
  maxDurationMs: 5000,
  stuckMs: 2000,
  lastChangeAt: 0,
};

test('verdicts', () => {
  assert.equal(evaluateGame({ ...base, completed: true }).verdict, 'finished');
  assert.equal(evaluateGame(base).verdict, 'continue');
  assert.equal(
    evaluateGame({ ...base, now: 5000, lastChangeAt: 4999 }).verdict,
    'timeout',
  );
  assert.equal(evaluateGame({ ...base, now: 2500 }).verdict, 'stuck');
  assert.equal(
    evaluateGame({ ...base, consecutiveErrors: 5 }).verdict,
    'error',
  );
});

test('max duration beats a game that keeps making progress', () => {
  assert.equal(
    evaluateGame({ ...base, now: 9000, lastChangeAt: 8999 }).verdict,
    'timeout',
  );
});

test('completion detection and signature', () => {
  assert.ok(isCompleted({ room: { status: 'completed' } }));
  assert.ok(isCompleted({ session: { status: 'completed' } }));
  assert.ok(
    !isCompleted({
      room: { status: 'in_progress' },
      session: { status: 'active' },
    }),
  );
  assert.notEqual(
    sessionSignature({ updatedAt: 'a' }),
    sessionSignature({ updatedAt: 'b' }),
  );
  assert.equal(sessionSignature(null), 'none');
});

function harness(infoFn, game) {
  let t = 0;
  const calls = { abandoned: [], alerts: [] };
  const config = loadConfig({}, []);
  config.director.pollMs = 1000;
  config.director.games = [game, { ...game, id: 'other_v1' }];
  const api = {
    createAiVsAi: async () => ({ id: 'room1' }),
    getRoomInfo: async () => infoFn(t),
    abandonRoom: async (id) => calls.abandoned.push(id),
  };
  const browser = { goto: async () => {}, recycle: async () => {} };
  const health = { update() {} };
  const log = { info() {}, warn() {}, error() {} };
  const d = new Director({
    config,
    api,
    browser,
    health,
    log,
    alert: async (k) => calls.alerts.push(k),
    now: () => t,
    wait: async (ms) => {
      t += ms;
    },
    rng: () => 0.1,
  });
  return { d, calls, time: () => t };
}

const game = {
  id: 'g_v1',
  title: 'G',
  maxDurationMs: 10_000,
  stuckMs: 4000,
  moveDelayMs: 2000,
  themes: ['x'],
};

test('forced skip: a game that never ends is abandoned at max duration', async () => {
  // state changes every poll so it is never "stuck", but never completes
  const { d, calls, time } = harness(
    (t) => ({ session: { status: 'active', updatedAt: String(t) } }),
    game,
  );
  const out = await d.playOne();
  assert.equal(out.verdict, 'timeout');
  assert.deepEqual(calls.abandoned, ['room1']);
  assert.ok(time() <= 11_000);
  assert.equal(d.last.result, 'Time limit reached');
});

test('stuck room (no state change) is abandoned early', async () => {
  const { d, calls, time } = harness(
    () => ({ session: { status: 'active', updatedAt: 'same' } }),
    game,
  );
  const out = await d.playOne();
  assert.equal(out.verdict, 'stuck');
  assert.equal(calls.abandoned.length, 1);
  assert.ok(time() < game.maxDurationMs);
});

test('BE errors while polling end the game with verdict error', async () => {
  const { d, calls } = harness(() => {
    throw new Error('boom');
  }, game);
  const out = await d.playOne();
  assert.equal(out.verdict, 'error');
  assert.equal(calls.abandoned.length, 1);
});

test('normal completion is not abandoned', async () => {
  const { d, calls } = harness(
    (t) => ({
      room: { status: t >= 3000 ? 'completed' : 'in_progress' },
      session: { updatedAt: String(t) },
    }),
    game,
  );
  const out = await d.playOne();
  assert.equal(out.verdict, 'finished');
  assert.equal(calls.abandoned.length, 0);
  assert.equal(d.last.result, 'Game complete');
});
