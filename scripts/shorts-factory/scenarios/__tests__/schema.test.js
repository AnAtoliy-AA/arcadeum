'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateScenario } = require('../schema');
const { buildScenario, buildPool } = require('../library');

const good = () => ({
  ...buildScenario('chess', 'puzzle', 'cyberpunk'),
  seed: 42,
});

test('a library scenario is valid', () => {
  assert.deepEqual(validateScenario(good()), { valid: true, errors: [] });
});

test('requires hook, voice script and dramatic moment', () => {
  for (const key of ['hook', 'voiceScript', 'dramaticMoment']) {
    const s = good();
    delete s[key];
    const r = validateScenario(s);
    assert.equal(r.valid, false, key);
    assert.ok(
      r.errors.some((e) => e.includes(key)),
      key,
    );
  }
});

test('dramatic moment must be a step or timestamp with a number', () => {
  assert.equal(
    validateScenario({ ...good(), dramaticMoment: { type: 'x', value: 1 } })
      .valid,
    false,
  );
  assert.equal(
    validateScenario({ ...good(), dramaticMoment: { type: 'step', value: -1 } })
      .valid,
    false,
  );
  assert.equal(
    validateScenario({
      ...good(),
      dramaticMoment: { type: 'timestamp', value: 3.5 },
    }).valid,
    true,
  );
});

test('rejects long hooks, em dashes, bad format and non integer seed', () => {
  assert.equal(
    validateScenario({ ...good(), hook: 'x'.repeat(81) }).valid,
    false,
  );
  assert.equal(
    validateScenario({ ...good(), voiceScript: 'a — b' }).valid,
    false,
  );
  assert.equal(validateScenario({ ...good(), format: 'nope' }).valid, false);
  assert.equal(validateScenario({ ...good(), seed: 1.5 }).valid, false);
  assert.equal(validateScenario(null).valid, false);
});

test('every scenario in the full pool is valid', () => {
  const pool = buildPool({ replay: true, puzzle: true });
  assert.ok(pool.length > 100);
  for (const s of pool) {
    const r = validateScenario({ ...s, seed: 1 });
    assert.equal(r.valid, true, `${s.id}: ${r.errors.join(',')}`);
  }
});
