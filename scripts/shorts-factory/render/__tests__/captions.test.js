'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  cleanScript,
  splitIntoLines,
  buildWordTimings,
  buildCaptionStates,
  placeLines,
} = require('../captions');

test('cleanScript strips urls, hashtags, emoji and dashes', () => {
  assert.equal(
    cleanScript('Play now 🎮 https://x.io #gaming — free'),
    'Play now , free',
  );
});

test('splitIntoLines makes short lines and respects limits', () => {
  const lines = splitIntoLines(
    'Chess against Stockfish in your browser. Forty AI bots, ranked seasons, and daily puzzles!',
  );
  assert.ok(lines.length >= 4);
  for (const l of lines) {
    assert.ok(l.split(' ').length <= 5, l);
    assert.ok(l.length <= 30, l);
  }
  assert.equal(
    lines.join(' ').replace(/[,.!]/g, ''),
    'Chess against Stockfish in your browser Forty AI bots ranked seasons and daily puzzles',
  );
});

test('splitIntoLines handles empty input', () => {
  assert.deepEqual(splitIntoLines('  '), []);
  assert.deepEqual(splitIntoLines(null), []);
});

test('placeLines inserts gaps between lines', () => {
  const l = placeLines([1, 2], ['a', 'b'], { startSec: 0.5, gapSec: 0.2 });
  assert.deepEqual(l, [
    { text: 'a', start: 0.5, end: 1.5 },
    { text: 'b', start: 1.7, end: 3.7 },
  ]);
});

test('word timings fill the line span, in order, no overlap', () => {
  const words = buildWordTimings([
    { text: 'play free now', start: 1, end: 2.5 },
  ]);
  assert.equal(words.length, 3);
  assert.equal(words[0].start, 1);
  assert.ok(Math.abs(words[2].end - 2.5) < 1e-9);
  for (let i = 1; i < words.length; i++) {
    assert.ok(Math.abs(words[i].start - words[i - 1].end) < 1e-9);
  }
});

test('longer words get more time', () => {
  const [a, b] = buildWordTimings([
    { text: 'go extraordinary', start: 0, end: 3 },
  ]);
  assert.ok(b.end - b.start > a.end - a.start);
});

test('caption states: one per word, same line, one active word at a time', () => {
  const states = buildCaptionStates([
    { text: 'play free now', start: 0, end: 1.5 },
    { text: 'no download', start: 1.7, end: 2.7 },
  ]);
  assert.equal(states.length, 5);
  assert.deepEqual(states[0].words, ['play', 'free', 'now']);
  assert.deepEqual(
    states.slice(0, 3).map((s) => s.activeIndex),
    [0, 1, 2],
  );
  // line stays up until the next word starts (no flicker)
  assert.equal(states[0].end, states[1].start);
  for (const s of states) assert.ok(s.end > s.start);
});
