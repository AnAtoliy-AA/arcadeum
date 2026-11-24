'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { pickScenario } = require('../picker');
const { assignLength } = require('../../length/assign');
const { allowedLengths, isWithinClass } = require('../../length/classes');
const { validateScenario } = require('../schema');
const { recordScenario, loadHistory } = require('../history');
const { puzzleScene, replayScene } = require('../scene-html');
const { puzzleTiming, replayTiming, captureMaxMs } = require('../timing');
const { buildScenario } = require('../library');
const fs = require('fs');
const os = require('os');
const path = require('path');

const AVAIL = { replay: true, puzzle: true };

function month(extra = {}) {
  const history = [];
  const picks = [];
  for (let d = 1; d <= 30; d++) {
    const date = `2026-12-${String(d).padStart(2, '0')}`;
    const s = pickScenario({
      date,
      history,
      available: AVAIL,
      formatWeights: null,
      lengthWeights: null,
      ...extra,
    });
    picks.push(s);
    history.push({
      date,
      scenarioId: s.id,
      game: s.game,
      format: s.format,
      theme: s.theme,
      lengthClass: s.lengthClass,
    });
  }
  return picks;
}

test('every pick has a length class the format allows, a valid shape and is deterministic', () => {
  for (const s of month()) {
    assert.ok(allowedLengths(s.format).includes(s.lengthClass), s.id);
    assert.ok(isWithinClass(s.durationSec, s.lengthClass), s.id);
    assert.deepEqual(validateScenario(s).errors, [], s.id);
  }
  const a = pickScenario({ date: '2026-12-05', available: AVAIL });
  const b = pickScenario({ date: '2026-12-05', available: AVAIL });
  assert.deepEqual(a, b);
});

test('the experiment uses several classes over a month and guess_the_move stays short', () => {
  const picks = month();
  assert.ok(new Set(picks.map((p) => p.lengthClass)).size >= 3);
  for (const p of picks.filter((x) => x.format === 'guess_the_move')) {
    assert.equal(p.lengthClass, 'short');
  }
});

test('a format with several classes rotates: never the same class twice in a row', () => {
  const history = [];
  let prev = null;
  for (let d = 1; d <= 12; d++) {
    const date = `2026-12-${String(d).padStart(2, '0')}`;
    const cls = assignLength({ format: 'puzzle', date, history });
    if (prev) assert.notEqual(cls, prev);
    prev = cls;
    history.push({ date, format: 'puzzle', lengthClass: cls });
  }
  // other formats' history does not influence it
  const c = assignLength({
    format: 'puzzle',
    date: '2026-12-20',
    history: [{ format: 'comeback', lengthClass: 'medium' }],
  });
  assert.ok(allowedLengths('puzzle').includes(c));
});

test('forced class wins when allowed, and is ignored when not', () => {
  assert.equal(
    assignLength({ format: 'puzzle', date: 'd', forced: 'long' }),
    'long',
  );
  assert.equal(
    assignLength({ format: 'guess_the_move', date: 'd', forced: 'long' }),
    'short',
  );
  const s = pickScenario({
    date: '2026-12-01',
    available: AVAIL,
    format: 'puzzle',
    lengthClass: 'long',
  });
  assert.equal(s.lengthClass, 'long');
  assert.equal(s.durationSec, 75);
});

test('length weights bias the draw; missing weights are uniform', () => {
  const counts = { short: 0, medium: 0, long: 0 };
  for (let i = 0; i < 300; i++) {
    counts[
      assignLength({
        format: 'puzzle',
        date: `x${i}`,
        weights: { short: 0.001, medium: 1, long: 0.001 },
      })
    ]++;
  }
  assert.ok(counts.medium > 250, JSON.stringify(counts));
  const u = { short: 0, medium: 0, long: 0 };
  for (let i = 0; i < 300; i++)
    u[assignLength({ format: 'puzzle', date: `y${i}`, weights: null })]++;
  assert.ok(u.short > 60 && u.medium > 60 && u.long > 60, JSON.stringify(u));
});

test('the weekly feature is never picked daily, only on request', () => {
  for (const s of month()) assert.notEqual(s.format, 'feature_story');
  const f = pickScenario({
    date: '2026-12-01',
    available: AVAIL,
    feature: true,
    game: 'chess',
  });
  assert.equal(f.format, 'feature_story');
  assert.equal(f.lengthClass, 'feature');
  assert.ok(f.durationSec >= 120 && f.durationSec <= 180);
  assert.deepEqual(validateScenario(f).errors, []);
});

test('history records the chosen class and the actual duration', () => {
  const file = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'sh-')),
    'h.json',
  );
  const s = pickScenario({
    date: '2026-12-02',
    available: AVAIL,
    format: 'puzzle',
    lengthClass: 'medium',
  });
  recordScenario(s, '2026-12-02', file, { actualDurationSec: 41.7 });
  const [e] = loadHistory(file);
  assert.equal(e.lengthClass, 'medium');
  assert.equal(e.durationSec, 42);
  assert.equal(e.actualDurationSec, 41.7);
});

test('scene pacing: short keeps legacy timing, longer classes add hints and time', () => {
  const short = buildScenario('chess', 'puzzle', 'default', 'short');
  assert.deepEqual(puzzleTiming(short), {
    setupMs: 0,
    count: 5,
    hints: [],
    slowMs: 2200,
    endMs: 1500,
  });
  const long = buildScenario('chess', 'puzzle', 'default', 'long');
  const t = puzzleTiming(long);
  assert.ok(t.count > 20 && t.hints.length >= 4 && t.setupMs > 5000);
  assert.ok(
    replayTiming(buildScenario('chess', 'comeback', 'default', 'long')).lead >
      4,
  );
  assert.equal(
    replayTiming(buildScenario('chess', 'comeback', 'default', 'medium')).hints
      .length,
    3,
  );
  assert.ok(captureMaxMs(long) > captureMaxMs(short));
});

test('long scenes render valid inline scripts', () => {
  const puzzle = {
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    solution: ['d1h5', 'b8c6'],
  };
  const html = puzzleScene({
    scenario: buildScenario('chess', 'puzzle', 'default', 'long'),
    puzzle,
  });
  const replay = {
    players: [{ id: 'a', displayName: 'A' }],
    actions: Array.from({ length: 30 }, () => ({
      userId: 'a',
      type: 'move',
      payload: {},
    })),
    result: { winnerIds: ['a'] },
  };
  const html2 = replayScene({
    scenario: buildScenario('chess', 'comeback', 'default', 'long'),
    replay,
    moment: { step: 20, label: 'x' },
  });
  for (const h of [html, html2]) {
    const m = h.match(/<script>([\s\S]*)<\/script>/);
    assert.doesNotThrow(() => new Function(m[1]));
  }
});
