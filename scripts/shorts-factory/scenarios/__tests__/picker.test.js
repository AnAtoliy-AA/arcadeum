'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { pickScenario } = require('../picker');
const { buildPool } = require('../library');
const { normalizeWeights } = require('../analytics-adapter');

const AVAIL = { replay: true, puzzle: true };

test('same date and inputs give the same scenario (deterministic)', () => {
  const a = pickScenario({ date: '2026-11-23', available: AVAIL });
  const b = pickScenario({ date: '2026-11-23', available: AVAIL });
  assert.deepEqual(a, b);
  assert.ok(Number.isInteger(a.seed));
});

test('different dates vary the pick', () => {
  const ids = new Set();
  for (let d = 1; d <= 20; d++)
    ids.add(
      pickScenario({
        date: `2026-12-${String(d).padStart(2, '0')}`,
        available: AVAIL,
      }).id,
    );
  assert.ok(ids.size > 8);
});

test('never repeats the same game or scenario inside the window', () => {
  const history = [];
  for (let d = 1; d <= 30; d++) {
    const date = `2026-12-${String(d).padStart(2, '0')}`;
    const s = pickScenario({ date, history, available: AVAIL });
    const recentGames = history.slice(-2).map((h) => h.game);
    assert.ok(!recentGames.includes(s.game), `${date} repeated game ${s.game}`);
    assert.ok(
      !history.some((h) => h.scenarioId === s.id),
      `${date} repeated ${s.id}`,
    );
    history.push({
      date,
      scenarioId: s.id,
      game: s.game,
      format: s.format,
      theme: s.theme,
    });
  }
});

test('rotates formats: not the same format two days in a row', () => {
  const history = [];
  let prev = null;
  for (let d = 1; d <= 15; d++) {
    const date = `2026-12-${String(d).padStart(2, '0')}`;
    const s = pickScenario({ date, history, available: AVAIL });
    if (prev) assert.notEqual(s.format, prev);
    prev = s.format;
    history.push({
      date,
      scenarioId: s.id,
      game: s.game,
      format: s.format,
      theme: s.theme,
    });
  }
});

test('relaxes constraints instead of failing when everything was used', () => {
  const pool = buildPool(
    { replay: false, puzzle: false },
    { games: ['chess'] },
  ).filter((s) => s.format === 'bot_match' && s.theme === 'default');
  assert.equal(pool.length, 1);
  const history = [
    {
      date: '2026-12-01',
      scenarioId: pool[0].id,
      game: 'chess',
      format: 'bot_match',
      theme: 'default',
    },
  ];
  const s = pickScenario({ date: '2026-12-02', history, pool });
  assert.equal(s.id, pool[0].id);
});

test('only offers replay formats when replay data is available', () => {
  for (let d = 1; d <= 25; d++) {
    const s = pickScenario({
      date: `2027-01-${String(d).padStart(2, '0')}`,
      available: { replay: false, puzzle: true },
    });
    assert.ok(
      !['comeback', 'last_second_win', 'replay_highlight'].includes(s.format),
    );
  }
});

test('puzzle formats are chess only', () => {
  for (let d = 1; d <= 40; d++) {
    const s = pickScenario({
      date: `2027-02-${String((d % 28) + 1).padStart(2, '0')}`,
      salt: String(d),
      available: AVAIL,
    });
    if (['puzzle', 'guess_the_move'].includes(s.format))
      assert.equal(s.game, 'chess');
  }
});

test('analytics weights bias the format; null weights fall back to uniform', () => {
  const count = (weights) => {
    const c = {};
    for (let i = 0; i < 400; i++) {
      const f = pickScenario({
        date: '2027-03-01',
        salt: String(i),
        available: AVAIL,
        formatWeights: weights,
      }).format;
      c[f] = (c[f] || 0) + 1;
    }
    return c;
  };
  const uniform = count(null);
  const biased = count({
    puzzle: 1,
    bot_match: 0,
    guess_the_move: 0,
    comeback: 0,
    last_second_win: 0,
    replay_highlight: 0,
  });
  assert.ok(
    biased.puzzle > uniform.puzzle * 1.5,
    `${biased.puzzle} vs ${uniform.puzzle}`,
  );
  assert.ok(Object.keys(uniform).length >= 5, 'uniform still spans formats');
});

test('honors forced game, format and theme and errors on impossible filters', () => {
  const s = pickScenario({
    date: '2027-01-01',
    game: 'go',
    format: 'bot_match',
    theme: 'zen',
    available: AVAIL,
  });
  assert.equal(s.id, 'go:bot_match:zen');
  assert.throws(() =>
    pickScenario({
      date: '2027-01-01',
      game: 'go',
      format: 'puzzle',
      available: AVAIL,
    }),
  );
});

test('normalizeWeights handles garbage safely', () => {
  assert.equal(normalizeWeights(null), null);
  assert.equal(normalizeWeights({}), null);
  assert.equal(normalizeWeights({ a: 'x' }), null);
  assert.equal(normalizeWeights({ a: 0 }), null);
  assert.deepEqual(normalizeWeights({ a: 2, b: 1 }), { a: 1, b: 0.5 });
});
