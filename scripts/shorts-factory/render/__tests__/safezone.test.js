'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getSafeZone,
  rectWithinZone,
  overflowPx,
  clampRectToZone,
  fitFontSize,
} = require('../safezone');

test('safe zone for 1080x1920 is top 12%, bottom 20%', () => {
  const z = getSafeZone();
  assert.equal(z.top, 230);
  assert.equal(z.bottom, 1536);
  assert.equal(z.left, 65);
  assert.equal(z.right, 1015);
});

test('rectWithinZone and overflowPx', () => {
  const z = getSafeZone();
  assert.ok(rectWithinZone({ x: 100, y: 300, width: 500, height: 200 }, z));
  const bad = { x: 100, y: 1500, width: 500, height: 200 };
  assert.ok(!rectWithinZone(bad, z));
  assert.equal(overflowPx(bad, z).bottom, 164);
  assert.equal(overflowPx(bad, z).top, 0);
});

test('clampRectToZone shifts rect inside zone', () => {
  const z = getSafeZone();
  const r = clampRectToZone({ x: 0, y: 1700, width: 400, height: 100 }, z);
  assert.ok(rectWithinZone(r, z));
});

test('fitFontSize shrinks for long text and floors at min', () => {
  assert.ok(fitFontSize('hi', 900) === 92);
  assert.ok(fitFontSize('a'.repeat(30), 900) < 92);
  assert.equal(fitFontSize('a'.repeat(200), 900), 48);
});
