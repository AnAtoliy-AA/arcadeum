'use strict';

/**
 * Length class analytics: which video length (short / medium / long) performs
 * best for the same formats. Used by the report ("by length class") and by
 * getLengthWeights (only trusted at >= minSamples scored posts per class).
 */

const { getConfig } = require('./config');
const { readHistory } = require('./store');
const { scoreRecord, sumStats } = require('./score');

const LENGTH_ORDER = ['short', 'medium', 'long', 'feature'];

const avg = (xs) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
const round = (n, d = 1) => (n == null ? null : Number(n.toFixed(d)));

/** avg view duration / video length, clamped to 0..1. Null without both. */
function completionRate(record) {
  const s = sumStats(record);
  const len = record.durationSec;
  if (s.avgViewDurationSec == null || !(len > 0)) return null;
  return Math.min(1, Math.max(0, s.avgViewDurationSec / len));
}

/**
 * One row per length class that has analyzed posts:
 * { lengthClass, samples, avgViews, avgViewDurationSec, completionRate, avgScore }
 * avgViewDurationSec / completionRate are null when no post has them.
 */
function lengthStats(records) {
  const groups = new Map();
  for (const r of records) {
    const score = scoreRecord(r);
    if (score == null || !r.lengthClass) continue;
    const g = groups.get(r.lengthClass) || {
      scores: [],
      views: [],
      durations: [],
      rates: [],
    };
    const s = sumStats(r);
    g.scores.push(score);
    g.views.push(s.views);
    if (s.avgViewDurationSec != null) g.durations.push(s.avgViewDurationSec);
    const rate = completionRate(r);
    if (rate != null) g.rates.push(rate);
    groups.set(r.lengthClass, g);
  }
  return [...groups.entries()]
    .map(([lengthClass, g]) => ({
      lengthClass,
      samples: g.scores.length,
      avgViews: Math.round(avg(g.views)),
      avgViewDurationSec: round(avg(g.durations)),
      completionRate: round(avg(g.rates), 3),
      avgScore: round(avg(g.scores), 3),
    }))
    .sort(
      (a, b) =>
        LENGTH_ORDER.indexOf(a.lengthClass) -
        LENGTH_ORDER.indexOf(b.lengthClass),
    );
}

/** Text section for the report. */
function formatLengthSection(records, { minSamples = 3 } = {}) {
  const rows = lengthStats(records.filter((r) => r.stats));
  const lines = ['', '== by length class =='];
  if (!rows.length) {
    lines.push('  not enough data');
    return lines.join('\n');
  }
  for (const r of rows) {
    const watch =
      r.avgViewDurationSec == null ? 'n/a' : `${r.avgViewDurationSec}s`;
    const done =
      r.completionRate == null
        ? 'n/a'
        : `${Math.round(r.completionRate * 100)}%`;
    const thin = r.samples < minSamples ? '  (too few samples to trust)' : '';
    lines.push(
      `  ${r.lengthClass.padEnd(8)} views ${String(r.avgViews).padEnd(7)} avg watch ${watch.padEnd(7)} completion ${done.padEnd(5)} score ${r.avgScore}  n=${r.samples}${thin}`,
    );
  }
  return lines.join('\n');
}

function uniform(classes) {
  const w = {};
  for (const c of classes) w[c] = 1 / classes.length;
  return w;
}

/**
 * getLengthWeights(classes?, opts?) -> { [class]: weight } summing to 1.
 * Uniform unless at least two classes have >= minSamples (default 3) scored
 * posts; untrusted classes get the average weight so they keep being tested.
 */
function getLengthWeights(classes, opts = {}) {
  const cfg = opts.config || getConfig();
  const minSamples = opts.minSamples || cfg.minSamples;
  const floor = opts.floor == null ? 0.5 : opts.floor;
  const records =
    opts.records || readHistory(opts.historyPath || cfg.historyPath);
  const rows = lengthStats(records.filter((r) => r.stats));
  const known =
    classes && classes.length ? classes : ['short', 'medium', 'long'];
  const trusted = rows.filter(
    (r) => r.samples >= minSamples && known.includes(r.lengthClass),
  );
  if (trusted.length < 2) return uniform(known);
  const scores = trusted.map((r) => r.avgScore);
  const min = Math.min(...scores);
  const span = Math.max(...scores) - min || 1;
  const raw = {};
  for (const c of known) {
    const row = trusted.find((r) => r.lengthClass === c);
    const norm = row ? (row.avgScore - min) / span : 0.5;
    raw[c] = floor + norm * (2 - 2 * floor);
  }
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  const out = {};
  for (const c of known) out[c] = Number((raw[c] / total).toFixed(6));
  return out;
}

module.exports = {
  lengthStats,
  completionRate,
  formatLengthSection,
  getLengthWeights,
};
