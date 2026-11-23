'use strict';

/**
 * Optional bridge to worker C's analytics module (../analytics).
 *
 * Contract (all optional, all wrapped in try/catch):
 *   analytics.getFormatWeights() -> { [format]: number } or null
 *     Higher = better results (views / watch time). Any positive scale; it is
 *     normalised here. Missing module, missing function, bad output, or
 *     thrown errors all give null, and the picker falls back to uniform weights.
 */
function loadFormatWeights() {
  try {
    // eslint-disable-next-line global-require, import/no-unresolved
    const mod = require('../analytics');
    const fn =
      mod &&
      (mod.getFormatWeights || (mod.default && mod.default.getFormatWeights));
    if (typeof fn !== 'function') return null;
    return normalizeWeights(fn());
  } catch {
    return null;
  }
}

function normalizeWeights(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const entries = Object.entries(raw).filter(
    ([, v]) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
  );
  if (entries.length === 0) return null;
  const max = Math.max(...entries.map(([, v]) => v));
  if (max <= 0) return null;
  return Object.fromEntries(entries.map(([k, v]) => [k, v / max]));
}

module.exports = { loadFormatWeights, normalizeWeights };
