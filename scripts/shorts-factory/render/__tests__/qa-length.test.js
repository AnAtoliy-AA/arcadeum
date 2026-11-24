'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateQuality } = require('../qa');
const { durationBounds } = require('../config');
const { getSafeZone } = require('../safezone');

const zone = getSafeZone();
const base = (durationSec) => ({
  durationSec,
  width: 1080,
  height: 1920,
  hasAudio: true,
  loudnessLufs: -14,
  firstFrameLuma: 90,
  captionRects: [
    { x: zone.left + 10, y: zone.top + 10, width: 100, height: 50 },
  ],
  voiceExpected: true,
  voiceMeanDb: -20,
});
const durationCheck = (m, opts) =>
  evaluateQuality(m, opts).checks.find((c) => c.id === 'duration');

test('QA duration uses the range of the length class', () => {
  const cases = [
    ['short', 20, true],
    ['short', 40, false],
    ['medium', 42, true],
    ['medium', 20, false],
    ['medium', 55, false],
    ['long', 75, true],
    ['long', 45, false],
    ['feature', 150, true],
    ['feature', 90, false],
    ['feature', 200, false],
  ];
  for (const [cls, sec, ok] of cases) {
    const c = durationCheck(base(sec), { lengthClass: cls });
    assert.equal(c.ok, ok, `${cls} ${sec}s`);
  }
});

test('QA boundaries are inclusive', () => {
  assert.equal(durationCheck(base(35), { lengthClass: 'medium' }).ok, true);
  assert.equal(durationCheck(base(50), { lengthClass: 'medium' }).ok, true);
  assert.equal(durationCheck(base(60), { lengthClass: 'long' }).ok, true);
  assert.equal(durationCheck(base(90), { lengthClass: 'long' }).ok, true);
});

test('without a length class the legacy 15-30s window still applies', () => {
  assert.equal(durationCheck(base(28)).ok, true);
  assert.equal(durationCheck(base(42)).ok, false);
  assert.match(
    durationCheck(base(42), { lengthClass: 'medium' }).detail,
    /medium/,
  );
});

test('a medium video passes the whole gate while a medium cut in a short gate fails', () => {
  assert.equal(
    evaluateQuality(base(42), { lengthClass: 'medium' }).passed,
    true,
  );
  assert.equal(
    evaluateQuality(base(42), { lengthClass: 'short' }).passed,
    false,
  );
});

test('durationBounds leaves room for the end card', () => {
  const b = durationBounds('long');
  assert.equal(b.minTotalSec, 60);
  assert.equal(b.maxTotalSec, 90);
  assert.equal(b.maxMainSec, 90 - 3);
});
