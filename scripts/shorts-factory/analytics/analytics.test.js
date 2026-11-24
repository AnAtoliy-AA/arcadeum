'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { recordPost, readHistory } = require('./store');
const { normalizeStats, fetchPostStats } = require('./postiz');
const { refreshStats } = require('./refresh');
const { scoreRecord, rankAll } = require('./score');
const { getFormatWeights } = require('./weights');
const { weeklySummary } = require('./summary');
const {
  appendManifest,
  ingestManifest,
  postsFromPostizResponse,
} = require('./manifest');
const { runAnalyticsHook } = require('./runner-hook');
const { formatReport } = require('./report');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'sa-'));
const DAY = 24 * 3600 * 1000;
const cfg = {
  minAgeHours: 24,
  maxAgeDays: 14,
  refreshIntervalHours: 12,
  minSamples: 3,
  statsWindowDays: 30,
  postizApiKey: 'test-key',
  postizBaseUrl: 'http://mock',
};
const payload = [
  {
    label: 'Views',
    data: [
      { total: 100, date: 'a' },
      { total: 50, date: 'b' },
    ],
  },
  { label: 'Likes', data: [{ total: 10 }] },
  { label: 'Comments', data: [{ total: 2 }] },
  { label: 'Shares', data: [{ total: 1 }] },
  { label: 'Link Clicks', data: [{ total: 3 }] },
  { label: 'Average View Duration', data: [{ total: 4 }, { total: 6 }] },
  { label: 'Unknown', data: [{ total: 9 }] },
];

test('normalizeStats maps labels and sums series', () => {
  const s = normalizeStats(payload);
  assert.strictEqual(s.views, 150);
  assert.strictEqual(s.likes, 10);
  assert.strictEqual(s.linkClicks, 3);
  assert.strictEqual(s.avgViewDurationSec, 6);
  assert.strictEqual(normalizeStats(null).views, 0);
});

test('fetchPostStats uses injected http and requires key', async () => {
  let seen;
  const s = await fetchPostStats('p1', {
    config: cfg,
    httpGet: async (url, h) => {
      seen = { url, h };
      return payload;
    },
  });
  assert.match(seen.url, /analytics\/post\/p1\?date=30$/);
  assert.strictEqual(seen.h.Authorization, 'test-key');
  assert.strictEqual(s.views, 150);
  await assert.rejects(
    fetchPostStats('p1', { config: { ...cfg, postizApiKey: '' } }),
  );
});

test('recordPost stores and upserts', () => {
  const f = path.join(tmp(), 'h.json');
  recordPost({ id: 'a', game: 'chess', format: 'f1' }, f);
  recordPost({ id: 'a', game: 'chess', format: 'f2' }, f);
  const h = readHistory(f);
  assert.strictEqual(h.length, 1);
  assert.strictEqual(h[0].format, 'f2');
  assert.deepStrictEqual(readHistory(path.join(tmp(), 'none.json')), []);
});

test('refreshStats only touches old enough posts and isolates errors', async () => {
  const f = path.join(tmp(), 'h.json');
  const now = Date.now();
  recordPost(
    {
      id: 'old',
      date: new Date(now - 3 * DAY).toISOString(),
      posts: [
        { platform: 'tiktok', postId: 'p1' },
        { platform: 'yt', postId: 'bad' },
      ],
    },
    f,
  );
  recordPost(
    {
      id: 'new',
      date: new Date(now - 2 * 3600 * 1000).toISOString(),
      posts: [{ platform: 'tiktok', postId: 'p2' }],
    },
    f,
  );
  recordPost({ id: 'noids', date: new Date(now - 3 * DAY).toISOString() }, f);
  const calls = [];
  const res = await refreshStats({
    config: cfg,
    historyPath: f,
    now,
    fetchStats: async (id) => {
      calls.push(id);
      if (id === 'bad') throw new Error('boom');
      return normalizeStats(payload);
    },
  });
  assert.deepStrictEqual(calls, ['p1', 'bad']);
  assert.strictEqual(res.refreshed, 1);
  assert.strictEqual(res.errors.length, 1);
  const again = await refreshStats({
    config: cfg,
    historyPath: f,
    now,
    fetchStats: async () => {
      throw new Error('should not be called');
    },
  });
  assert.strictEqual(again.refreshed, 0);
});

const withStats = (id, format, views, likes, extra = {}) => ({
  id,
  game: extra.game || 'chess',
  format,
  hook: extra.hook || 'h',
  voice: 'v',
  cta: 'c',
  stats: {
    byPost: { x: { views, likes, comments: 0, shares: 0, linkClicks: 0 } },
  },
});

test('scoreRecord rewards reach and engagement; null without stats', () => {
  assert.strictEqual(scoreRecord({}), null);
  assert.ok(
    scoreRecord(withStats('a', 'f', 1000, 100)) >
      scoreRecord(withStats('b', 'f', 10, 0)),
  );
});

test('rankAll flags best and worst', () => {
  const recs = [
    withStats('1', 'good', 5000, 500),
    withStats('2', 'mid', 500, 20),
    withStats('3', 'bad', 5, 0),
  ];
  const r = rankAll(recs).format;
  assert.strictEqual(r[0].key, 'good');
  assert.strictEqual(r[0].flag, 'best');
  assert.strictEqual(r[2].flag, 'worst');
  assert.match(formatReport(recs), /BEST/);
});

test('getFormatWeights is uniform without enough data', () => {
  const w = getFormatWeights(['a', 'b'], {
    config: cfg,
    records: [withStats('1', 'a', 100, 5)],
  });
  assert.deepStrictEqual(w, { a: 0.5, b: 0.5 });
  assert.deepStrictEqual(
    getFormatWeights([], { config: cfg, records: [] }),
    {},
  );
});

test('getFormatWeights favors better format, sums to 1, keeps floor', () => {
  const recs = [];
  for (let i = 0; i < 3; i++) {
    recs.push(withStats('a' + i, 'a', 5000, 500));
    recs.push(withStats('b' + i, 'b', 5, 0));
  }
  const w = getFormatWeights(['a', 'b', 'c'], { config: cfg, records: recs });
  assert.ok(w.a > w.b);
  assert.ok(w.b > 0);
  assert.ok(w.c > 0);
  assert.ok(Math.abs(w.a + w.b + w.c - 1) < 1e-3);
});

test('weeklySummary text and empty case', () => {
  const now = Date.now();
  assert.match(weeklySummary([], { now }), /no analyzed posts/);
  const rec = {
    ...withStats('1', 'good', 100, 5),
    date: new Date(now - DAY).toISOString(),
  };
  const txt = weeklySummary([rec, { ...rec, id: '2', format: 'other' }], {
    now,
  });
  assert.match(txt, /Shorts weekly \(2 posts/);
  assert.match(txt, /Formats: best/);
});

test('manifest ingest and postiz response parsing', () => {
  const d = tmp();
  const m = path.join(d, 'm.ndjson');
  const h = path.join(d, 'h.json');
  appendManifest(
    {
      game: 'chess',
      posts: postsFromPostizResponse('tiktok', [
        { postId: 'z', integration: 'i' },
      ]),
    },
    m,
  );
  const rec = ingestManifest({ manifestPath: m, historyPath: h });
  assert.strictEqual(rec.length, 1);
  assert.strictEqual(readHistory(h)[0].posts[0].postId, 'z');
  assert.ok(!fs.existsSync(m));
  assert.deepStrictEqual(
    ingestManifest({ manifestPath: m, historyPath: h }),
    [],
  );
});

test('runner hook: preview is a no-op, fallback records, errors swallowed', async () => {
  const logs = [];
  const log = (m) => logs.push(m);
  assert.deepStrictEqual(
    await runAnalyticsHook({ isPreview: true, results: [], log }),
    { skipped: 'preview' },
  );
  const recorded = [];
  const out = await runAnalyticsHook({
    isPreview: false,
    targetGame: 'chess',
    log,
    results: [
      { name: 'Gameplay Short', success: true },
      { name: 'X', success: false },
    ],
    deps: {
      ingestManifest: () => [],
      recordPost: (r) => recorded.push(r),
      refreshStats: async () => ({ refreshed: 0, errors: [] }),
    },
  });
  assert.strictEqual(out.recorded, 1);
  assert.strictEqual(recorded[0].game, 'chess');
  const bad = await runAnalyticsHook({
    isPreview: false,
    results: [],
    log,
    deps: {
      ingestManifest: () => {
        throw new Error('x');
      },
      refreshStats: async () => {
        throw new Error('y');
      },
    },
  });
  assert.strictEqual(bad.recorded, 0);
});
