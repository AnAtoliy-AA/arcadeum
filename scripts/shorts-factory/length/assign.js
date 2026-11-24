'use strict';

const { createRng } = require('../scenarios/seed');
const { allowedLengths, DAILY_CLASSES } = require('./classes');

/**
 * Length experiment: choose a length class for a format.
 *
 * - A format with one allowed class always gets it (guess_the_move: short).
 * - Otherwise the class used last for the same format is skipped (rotation),
 *   and the rest are drawn at random, weighted by `weights` when analytics has
 *   enough samples (missing or invalid weights mean uniform).
 * - `forced` wins when the format supports it (CLI flag or tests).
 * - The daily picker never assigns `feature`; that is opt-in only.
 *
 * Pure given its inputs: the rng is derived from date + salt + format.
 */
function assignLength({
  format,
  date,
  history = [],
  weights = null,
  forced = null,
  salt = '',
}) {
  const allowed = allowedLengths(format).filter(
    (c) => DAILY_CLASSES.includes(c) || c === forced,
  );
  if (forced && allowed.includes(forced)) return forced;
  const pool = allowed.length ? allowed : ['short'];
  if (pool.length === 1) return pool[0];

  let last = null;
  for (let i = history.length - 1; i >= 0; i--) {
    const e = history[i];
    if (e.format === format && e.lengthClass) {
      last = e.lengthClass;
      break;
    }
  }
  const candidates = pool.filter((c) => c !== last);
  const options = candidates.length ? candidates : pool;

  const w = options.map((c) => {
    const v = weights && weights[c];
    return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null;
  });
  const known = w.filter((v) => v !== null);
  const fallback = known.length
    ? known.reduce((a, b) => a + b, 0) / known.length
    : 1;
  const eff = w.map((v) => (v === null ? fallback : v));
  const rng = createRng(`${date}|len|${format}|${salt}`);
  let r = rng() * eff.reduce((a, b) => a + b, 0);
  for (let i = 0; i < options.length; i++) {
    r -= eff[i];
    if (r <= 0) return options[i];
  }
  return options[options.length - 1];
}

module.exports = { assignLength };
