'use strict';

/**
 * getFormatWeights(formats?, opts?) -> { [format]: weight } summing to 1.
 *
 * Uniform when data is thin: a format is only trusted with >= minSamples
 * scored posts. If fewer than 2 formats are trusted, everything stays uniform.
 * Otherwise weights follow a softmax-like blend with an exploration floor so
 * no format is ever starved (untrusted formats get the average weight).
 */

const { getConfig } = require('./config');
const { readHistory } = require('./store');
const { aggregate } = require('./score');

function uniform(formats) {
  const w = {};
  for (const f of formats) w[f] = 1 / formats.length;
  return w;
}

function getFormatWeights(formats, opts = {}) {
  const cfg = opts.config || getConfig();
  const minSamples = opts.minSamples || cfg.minSamples;
  const floor = opts.floor == null ? 0.5 : opts.floor; // min share of uniform
  const records =
    opts.records || readHistory(opts.historyPath || cfg.historyPath);
  const rows = aggregate(records, 'format');
  const known = formats && formats.length ? formats : rows.map((r) => r.key);
  if (!known.length) return {};

  const trusted = rows.filter(
    (r) => r.samples >= minSamples && known.includes(r.key),
  );
  if (trusted.length < 2) return uniform(known);

  const scores = trusted.map((r) => r.avgScore);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const span = max - min || 1;
  const avgNorm = 0.5;
  const raw = {};
  for (const f of known) {
    const row = trusted.find((r) => r.key === f);
    const norm = row ? (row.avgScore - min) / span : avgNorm;
    // map [0,1] -> [floor, 2 - floor] relative to uniform
    raw[f] = floor + norm * (2 - 2 * floor);
  }
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  const out = {};
  for (const f of known) out[f] = Number((raw[f] / total).toFixed(6));
  return out;
}

module.exports = { getFormatWeights };
