'use strict';

/** Exponential backoff: 1s, 2s, 4s ... capped. Pure. */
function nextBackoff(attempt, { minMs = 1000, maxMs = 60_000 } = {}) {
  return Math.min(maxMs, minMs * 2 ** Math.max(0, attempt));
}

module.exports = { nextBackoff };
