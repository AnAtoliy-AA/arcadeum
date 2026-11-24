'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { sidecarPathFor, loadSidecar, applySidecar } = require('../sidecar');
const { deriveHook } = require('../hook');

test('sidecar path sits next to the video', () => {
  assert.equal(sidecarPathFor('/a/b/clip.mp4'), '/a/b/clip.scenario.json');
});

test('loadSidecar reads hook, voiceScript and dramaticMomentSec', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-'));
  const video = path.join(dir, 'clip.mp4');
  fs.writeFileSync(
    sidecarPathFor(video),
    JSON.stringify({
      id: 's1',
      hook: 'Epic comeback',
      voiceScript: 'Play now.',
      dramaticMomentSec: 4.5,
    }),
  );
  const sc = loadSidecar(video);
  assert.equal(sc.hook, 'Epic comeback');
  assert.equal(sc.dramaticMomentMs, 4500);
  assert.equal(loadSidecar(path.join(dir, 'missing.mp4')), null);
});

test('applySidecar fills gaps but never overrides explicit options', () => {
  const sc = {
    id: 's1',
    hook: 'Epic comeback',
    voiceScript: 'Play now.',
    dramaticMomentMs: 4500,
  };
  const merged = applySidecar(
    { scenario: 'chess_demo', caption: undefined },
    sc,
  );
  assert.equal(deriveHook({ scenario: merged.scenario }), 'Epic comeback');
  assert.equal(merged.caption, 'Play now.');
  assert.equal(merged.dramaticMomentMs, 4500);
  const explicit = applySidecar(
    { scenario: 'x', caption: 'mine', dramaticMomentMs: 100 },
    sc,
  );
  assert.equal(explicit.caption, 'mine');
  assert.equal(explicit.dramaticMomentMs, 100);
  assert.deepEqual(applySidecar({ a: 1 }, null), { a: 1 });
});

test('sidecar carries the length class; structured scripts replace the caption body', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-'));
  const video = path.join(dir, 'clip.mp4');
  fs.writeFileSync(
    sidecarPathFor(video),
    JSON.stringify({
      id: 's',
      hook: 'H',
      voiceScript: 'One. Two.',
      lengthClass: 'medium',
    }),
  );
  const sc = loadSidecar(video);
  assert.equal(sc.lengthClass, 'medium');
  const merged = applySidecar({ scenario: 'x' }, sc);
  assert.equal(merged.lengthClass, 'medium');
  assert.equal(merged.voiceScript, 'One. Two.');
  assert.equal(applySidecar({ lengthClass: 'long' }, sc).lengthClass, 'long');
  const short = applySidecar(
    { scenario: 'x' },
    { ...sc, lengthClass: 'short' },
  );
  assert.equal(short.voiceScript, undefined);
  assert.equal(loadSidecar(video) && normalizeLen('bogus'), undefined);
});

function normalizeLen(v) {
  return require('../sidecar').normalizeSidecar({ lengthClass: v }).lengthClass;
}
