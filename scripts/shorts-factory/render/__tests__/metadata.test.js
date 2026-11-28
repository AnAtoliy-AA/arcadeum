'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPlatformMetadata, parseTags, truncate } = require('../metadata');
const { pickCtaVariant } = require('../cta');
const { deriveHook, clampHook, pickStartOffsetSec } = require('../hook');

const base = {
  caption:
    'This is what next-gen gaming actually looks like 🎮⚡ 20+ games, ranked matchmaking, and real rewards',
  hook: 'Can you beat Stockfish?',
  tags: '#arcadeumgames #gaming #gamers #p2e #onlinegaming #chess #strategy',
  ctaVariant: { id: 'A', text: 'Play free, no download' },
};

test('per-platform variants respect limits and tag counts', () => {
  const m = buildPlatformMetadata(base);
  assert.ok(m.youtube.title.length <= 100);
  assert.ok(m.youtube.title.endsWith('#Shorts'));
  assert.equal(m.tiktok.hashtags.length, 4);
  assert.equal(m.instagram.hashtags.length, 5);
  assert.equal(m.youtube.hashtags.length, 3);
  assert.ok(m.tiktok.hashtags.includes('#fyp'));
  assert.ok(m.instagram.hashtags.includes('#reels'));
  assert.ok(m.youtube.hashtags.includes('#shorts'));
  assert.ok(m.tiktok.content.length <= 160);
  assert.match(m.instagram.content, /link in bio/);
  assert.match(m.youtube.content, /https:\/\/arcadeum\.games/);
});

test('variants differ per platform', () => {
  const m = buildPlatformMetadata(base);
  assert.notEqual(m.tiktok.content, m.instagram.content);
  assert.notEqual(m.tiktok.title, m.youtube.title);
});

test('no em dashes or emoji leak into metadata', () => {
  const m = buildPlatformMetadata({ ...base, hook: 'Wow — big 🔥' });
  for (const p of Object.values(m)) assert.ok(!/—/.test(p.title + p.content));
});

test('parseTags dedupes and drops junk', () => {
  assert.deepEqual(parseTags('#a #A b #c'), ['#a', '#c']);
  assert.equal(truncate('short', 10), 'short');
  assert.ok(truncate('word '.repeat(30), 20).length <= 20);
});

test('CTA rotates by day and can be forced or customised', () => {
  const d1 = new Date('2026-01-01T12:00:00Z');
  const d2 = new Date('2026-01-02T12:00:00Z');
  const a = pickCtaVariant({ env: {}, now: d1 });
  const b = pickCtaVariant({ env: {}, now: d2 });
  assert.notEqual(a.id, b.id);
  assert.equal(
    pickCtaVariant({ env: { SHORTS_CTA_VARIANT: 'b' }, now: d1 }).id,
    'B',
  );
  assert.equal(
    pickCtaVariant({ env: { SHORTS_CTA_TEXT: 'Join now' }, now: d1 }).id,
    'custom',
  );
  assert.ok(pickCtaVariant({ env: {}, now: d1 }).text.length > 0);
});

test('hook derivation: provided > scenario map > caption > default', () => {
  assert.equal(
    deriveHook({ scenario: { name: 'x', hook: 'Epic comeback' } }),
    'Epic comeback',
  );
  assert.equal(
    deriveHook({ scenario: 'chess_gameplay' }),
    'Can you beat Stockfish?',
  );
  assert.equal(
    deriveHook({ scenario: 'zzz', caption: 'Play. Compete. Earn. Repeat!' }),
    'Play',
  );
  assert.equal(deriveHook({}), 'Free games, real players');
  assert.ok(clampHook('a b c d e f g h i j').split(' ').length <= 6);
  assert.ok(clampHook('x'.repeat(80)).length <= 34);
});

test('start offset moves to the dramatic moment only when footage remains', () => {
  const ok = pickStartOffsetSec({
    startOffsetMs: 500,
    recordedDurationMs: 30000,
    dramaticMomentMs: 12000,
  });
  assert.equal(ok.usedDramatic, true);
  assert.ok(Math.abs(ok.startSec - 11.4) < 1e-9);
  const late = pickStartOffsetSec({
    startOffsetMs: 500,
    recordedDurationMs: 30000,
    dramaticMomentMs: 29000,
  });
  assert.equal(late.usedDramatic, false);
  assert.equal(late.startSec, 0.5);
  assert.equal(
    pickStartOffsetSec({ startOffsetMs: 0, recordedDurationMs: 9000 })
      .usedDramatic,
    false,
  );
});
