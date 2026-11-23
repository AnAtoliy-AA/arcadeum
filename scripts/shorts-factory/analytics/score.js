'use strict';

/**
 * Scoring. Prefers retention (watch time) and conversion signals over raw
 * views: score is per 1000 views-ish and bounded so one viral post does not
 * dominate. Higher is better.
 */

const DIMENSIONS = ['format', 'hook', 'game', 'voice', 'cta'];

function sumStats(record) {
  const out = {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    linkClicks: 0,
    watchTimeSec: 0,
    avgViewDurationSec: null,
  };
  const per = record.stats && record.stats.byPost;
  const list = per ? Object.values(per) : record.stats ? [record.stats] : [];
  const avgs = [];
  for (const s of list) {
    for (const k of ['views', 'likes', 'comments', 'shares', 'linkClicks']) {
      out[k] += Number(s[k]) || 0;
    }
    if (s.watchTimeSec != null) out.watchTimeSec += Number(s.watchTimeSec) || 0;
    if (s.avgViewDurationSec != null) avgs.push(Number(s.avgViewDurationSec));
  }
  if (avgs.length) {
    out.avgViewDurationSec = avgs.reduce((a, b) => a + b, 0) / avgs.length;
  }
  return out;
}

/**
 * Score one record. Components:
 *  - reach: log10(1 + views) * 10
 *  - engagement: (likes + 2*comments + 3*shares) per view * 100
 *  - clicks: linkClicks per view * 1000 (signups proxy, weighted high)
 *  - retention: avgViewDurationSec * 2 when available
 */
function scoreRecord(record) {
  if (!record || !record.stats) return null;
  const s = sumStats(record);
  const v = Math.max(s.views, 1);
  const reach = Math.log10(1 + s.views) * 10;
  const engagement = ((s.likes + 2 * s.comments + 3 * s.shares) / v) * 100;
  const clicks = (s.linkClicks / v) * 1000;
  const retention = s.avgViewDurationSec ? s.avgViewDurationSec * 2 : 0;
  return Number((reach + engagement + clicks + retention).toFixed(3));
}

/** Group scored records by a dimension and average the score. */
function aggregate(records, dimension) {
  const groups = new Map();
  for (const r of records) {
    const score = scoreRecord(r);
    const key = r[dimension];
    if (score == null || key == null || key === '') continue;
    const g = groups.get(key) || { key, n: 0, total: 0, views: 0 };
    g.n += 1;
    g.total += score;
    g.views += sumStats(r).views;
    groups.set(key, g);
  }
  return [...groups.values()]
    .map((g) => ({
      key: g.key,
      samples: g.n,
      avgScore: Number((g.total / g.n).toFixed(3)),
      avgViews: Math.round(g.views / g.n),
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
}

/** Rank every dimension and flag best/worst (needs >= 2 groups). */
function rankAll(records, { minSamples = 1 } = {}) {
  const out = {};
  for (const d of DIMENSIONS) {
    const rows = aggregate(records, d).filter((r) => r.samples >= minSamples);
    out[d] = rows.map((r, i) => ({
      ...r,
      flag:
        rows.length < 2
          ? null
          : i === 0
            ? 'best'
            : i === rows.length - 1
              ? 'worst'
              : null,
    }));
  }
  return out;
}

module.exports = { DIMENSIONS, scoreRecord, sumStats, aggregate, rankAll };
