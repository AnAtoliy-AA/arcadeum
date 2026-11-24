'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  lengthStats,
  completionRate,
  getLengthWeights,
  formatLengthSection,
} = require('../../analytics/length');
const { formatReport } = require('../../analytics/report');
const {
  buildManifestEntry,
  recordPosted,
} = require('../../analytics/record-post');
const { ingestManifest } = require('../../analytics/manifest');
const { readHistory } = require('../../analytics/store');
const analytics = require('../../analytics');

const rec = (
  lengthClass,
  views,
  avgViewDurationSec,
  durationSec,
  format = 'puzzle',
) => ({
  id: `${lengthClass}-${views}-${Math.random()}`,
  format,
  lengthClass,
  durationSec,
  stats: {
    views,
    likes: Math.round(views / 20),
    comments: 0,
    shares: 0,
    linkClicks: 0,
    avgViewDurationSec,
  },
});
const many = (cls, n, views, avgDur, dur) =>
  Array.from({ length: n }, (_, i) => rec(cls, views + i, avgDur, dur));
const cfg = { minSamples: 3 };

test('lengthStats averages views, watch time and completion per class', () => {
  const rows = lengthStats([
    rec('short', 100, 10, 20),
    rec('short', 300, 14, 20),
    rec('long', 500, 30, 60),
    { ...rec('medium', 50, null, 40), stats: { views: 50 } },
    { id: 'x', lengthClass: 'short', stats: null },
    { id: 'y', stats: { views: 5 } },
  ]);
  const by = Object.fromEntries(rows.map((r) => [r.lengthClass, r]));
  assert.equal(by.short.samples, 2);
  assert.equal(by.short.avgViews, 200);
  assert.equal(by.short.avgViewDurationSec, 12);
  assert.equal(by.short.completionRate, 0.6);
  assert.equal(by.long.completionRate, 0.5);
  assert.equal(by.medium.avgViewDurationSec, null);
  assert.equal(by.medium.completionRate, null);
  assert.deepEqual(
    rows.map((r) => r.lengthClass),
    ['short', 'medium', 'long'],
  );
});

test('completion rate is clamped and needs both numbers', () => {
  assert.equal(completionRate(rec('short', 10, 40, 20)), 1);
  assert.equal(completionRate(rec('short', 10, 5, null)), null);
  assert.equal(completionRate(rec('short', 10, undefined, 20)), null);
});

test('report has a by length class section with the metrics', () => {
  const records = [
    ...many('short', 3, 100, 12, 20),
    ...many('long', 3, 400, 30, 60),
  ];
  const text = formatReport(records);
  assert.match(text, /== by length class ==/);
  assert.match(text, /short\s+views 101\s+avg watch 12s\s+completion 60%/);
  assert.match(text, /long\s+views 401\s+avg watch 30s\s+completion 50%/);
  assert.match(formatLengthSection([]), /not enough data/);
  assert.match(
    formatLengthSection(records.slice(0, 1), { minSamples: 3 }),
    /too few samples/,
  );
});

test('length weights are uniform until >= 3 samples in at least two classes', () => {
  const classes = ['short', 'medium', 'long'];
  const uniform = { short: 1 / 3, medium: 1 / 3, long: 1 / 3 };
  const near = (a, b) =>
    Object.keys(b).forEach((k) => assert.ok(Math.abs(a[k] - b[k]) < 1e-3, k));
  near(getLengthWeights(classes, { records: [], config: cfg }), uniform);
  // 2 samples each is not enough
  near(
    getLengthWeights(classes, {
      records: [
        ...many('short', 2, 100, 10, 20),
        ...many('long', 2, 900, 40, 60),
      ],
      config: cfg,
    }),
    uniform,
  );
  // only one trusted class stays uniform
  near(
    getLengthWeights(classes, {
      records: [
        ...many('short', 5, 100, 10, 20),
        ...many('long', 2, 900, 40, 60),
      ],
      config: cfg,
    }),
    uniform,
  );
});

test('length weights favor the better class once enough samples exist', () => {
  const classes = ['short', 'medium', 'long'];
  const records = [
    ...many('short', 3, 100, 8, 20),
    ...many('long', 3, 5000, 45, 60),
  ];
  const w = getLengthWeights(classes, { records, config: cfg });
  assert.ok(w.long > w.short);
  assert.ok(w.short > 0, 'exploration floor keeps every class alive');
  assert.ok(
    w.medium > w.short && w.medium < w.long,
    'untrusted class gets the middle weight',
  );
  assert.ok(Math.abs(Object.values(w).reduce((a, b) => a + b, 0) - 1) < 1e-3);
  assert.equal(typeof analytics.getLengthWeights, 'function');
});

test('manifest entry carries game, format, hook, voice, cta, length class and post ids', () => {
  const entry = buildManifestEntry({
    game: 'chess',
    scenario: 'chess:puzzle:default',
    format: 'puzzle',
    hook: 'Find it',
    voice: { voice: 'en-US-GuyNeural', rate: '+6%' },
    cta: { id: 'B', text: 'x' },
    lengthClass: 'medium',
    durationSec: 41.234,
    results: [
      {
        platform: 'YouTube Shorts',
        data: [{ postId: 'yt1', integration: 'i' }],
      },
      { platform: 'TikTok', data: { id: 'tt1' } },
      { platform: 'x', success: false },
      { platform: 'instagram', data: [] },
    ],
  });
  assert.equal(entry.voice, 'en-US-GuyNeural');
  assert.equal(entry.cta, 'B');
  assert.equal(entry.lengthClass, 'medium');
  assert.equal(entry.durationSec, 41.23);
  assert.deepEqual(entry.posts, [
    { platform: 'youtube', postId: 'yt1' },
    { platform: 'tiktok', postId: 'tt1' },
  ]);
  assert.equal(buildManifestEntry({ game: 'x', results: [] }), null);
  assert.equal(
    buildManifestEntry({
      game: 'x',
      durationSec: 70,
      results: [{ platform: 'x', data: { id: '1' } }],
    }).lengthClass,
    'long',
  );
});

test('recordPosted writes a manifest line that ingests into history with length data', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rp-'));
  const manifestPath = path.join(dir, 'm.ndjson');
  const historyPath = path.join(dir, 'h.json');
  const append = (e) =>
    require('../../analytics/manifest').appendManifest(e, manifestPath);
  const logs = [];
  const entry = recordPosted(
    {
      game: 'chess',
      format: 'puzzle',
      hook: 'h',
      voice: 'v',
      cta: 'A',
      lengthClass: 'long',
      durationSec: 72,
      results: [{ platform: 'tiktok', data: { postId: 'p9' } }],
    },
    { append, log: (m) => logs.push(m) },
  );
  assert.ok(entry);
  assert.equal(
    recordPosted(
      { game: 'chess', results: [] },
      { append, log: (m) => logs.push(m) },
    ),
    null,
  );
  assert.equal(
    recordPosted(
      { game: 'c', results: [{ platform: 'x', data: { id: '1' } }] },
      {
        append: () => {
          throw new Error('disk');
        },
      },
    ),
    null,
  );
  ingestManifest({ manifestPath, historyPath });
  const [r] = readHistory(historyPath);
  assert.equal(r.lengthClass, 'long');
  assert.equal(r.durationSec, 72);
  assert.deepEqual(r.posts, [{ platform: 'tiktok', postId: 'p9' }]);
  assert.equal(r.cta, 'A');
});
