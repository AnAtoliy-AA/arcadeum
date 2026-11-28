'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadHistory, recordScenario } = require('../history');
const { buildScenario } = require('../library');

const tmp = () =>
  path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'hist-')), 'sub', 'h.json');

test('missing or corrupt file gives an empty history', () => {
  const f = tmp();
  assert.deepEqual(loadHistory(f), []);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, '{nope');
  assert.deepEqual(loadHistory(f), []);
});

test('records, dedupes the same day and caps the size', () => {
  const f = tmp();
  const s = buildScenario('chess', 'bot_match', 'zen');
  recordScenario(s, '2026-12-01', f);
  recordScenario(s, '2026-12-01', f);
  assert.equal(loadHistory(f).length, 1);
  for (let i = 0; i < 250; i++)
    recordScenario({ ...s, id: `x${i}` }, '2026-12-02', f);
  assert.equal(loadHistory(f).length, 200);
});
