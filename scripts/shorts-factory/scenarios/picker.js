'use strict';

const { buildPool } = require('./library');
const { createRng, dateKey, hashString } = require('./seed');
const { loadHistory } = require('./history');
const { loadFormatWeights } = require('./analytics-adapter');

const DEFAULTS = {
  scenarioWindowDays: 21, // never repeat the same scenario inside this window
  gameWindowDays: 3, // avoid the same game inside this window
  formatWindowDays: 1, // avoid same format two days in a row
  themeWindowDays: 2,
  analyticsInfluence: 0.6, // 0 = ignore analytics, 1 = fully analytics driven
};

function daysBetween(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

function recent(history, date, days, key) {
  const set = new Set();
  for (const e of history) {
    const age = daysBetween(e.date, date);
    if (age >= 0 && age <= days && e[key]) set.add(e[key]);
  }
  return set;
}

/**
 * Pick one scenario for `date`. Pure given its inputs (rng is derived from the
 * date plus `salt`), so tests and re-runs on the same day are reproducible.
 *
 * Constraints relax in this order if nothing is left: format/theme windows,
 * then game window, then scenario window.
 *
 * opts: { date, history, available, formatWeights, game, format, theme,
 *         salt, windows, pool }
 */
function pickScenario(opts = {}) {
  const cfg = { ...DEFAULTS, ...(opts.windows || {}) };
  const date = opts.date || dateKey();
  const history = opts.history || [];
  const available = opts.available || { replay: false, puzzle: true };
  const weights = opts.formatWeights === undefined ? null : opts.formatWeights;

  let pool =
    opts.pool || buildPool(available, opts.game ? { games: [opts.game] } : {});
  if (opts.game) pool = pool.filter((s) => s.game === opts.game);
  if (opts.format) pool = pool.filter((s) => s.format === opts.format);
  if (opts.theme) pool = pool.filter((s) => s.theme === opts.theme);
  if (pool.length === 0)
    throw new Error('No scenario matches the requested filters');

  const usedScenarios = recent(
    history,
    date,
    cfg.scenarioWindowDays,
    'scenarioId',
  );
  const usedGames = recent(history, date, cfg.gameWindowDays, 'game');
  const usedFormats = recent(history, date, cfg.formatWindowDays, 'format');
  const usedThemes = recent(history, date, cfg.themeWindowDays, 'theme');

  const stages = [
    (s) =>
      !usedScenarios.has(s.id) &&
      !usedGames.has(s.game) &&
      !usedFormats.has(s.format) &&
      !usedThemes.has(s.theme),
    (s) =>
      !usedScenarios.has(s.id) &&
      !usedGames.has(s.game) &&
      !usedFormats.has(s.format),
    (s) => !usedScenarios.has(s.id) && !usedGames.has(s.game),
    (s) => !usedScenarios.has(s.id),
    () => true,
  ];
  let candidates = pool;
  for (const keep of stages) {
    const filtered = pool.filter(keep);
    if (filtered.length > 0) {
      candidates = filtered;
      break;
    }
  }

  const rng = createRng(`${date}|${opts.salt || ''}`);
  const weightOf = (s) => {
    if (!weights || typeof weights[s.format] !== 'number') return 1;
    return (
      1 -
      cfg.analyticsInfluence +
      cfg.analyticsInfluence * (0.1 + 0.9 * weights[s.format]) * 2
    );
  };
  // Pick format first (so games with many themes do not skew the weights),
  // then a uniformly random game/theme among that format's candidates.
  const byFormat = new Map();
  for (const s of candidates) {
    if (!byFormat.has(s.format)) byFormat.set(s.format, []);
    byFormat.get(s.format).push(s);
  }
  const formats = [...byFormat.keys()].sort();
  const fw = formats.map((f) => Math.max(0.01, weightOf(byFormat.get(f)[0])));
  let r = rng() * fw.reduce((a, b) => a + b, 0);
  let chosenFormat = formats[formats.length - 1];
  for (let i = 0; i < formats.length; i++) {
    r -= fw[i];
    if (r <= 0) {
      chosenFormat = formats[i];
      break;
    }
  }
  const list = byFormat.get(chosenFormat);
  const chosen = list[Math.floor(rng() * list.length)];
  return { ...chosen, seed: hashString(`${date}|${chosen.id}`) };
}

/** Convenience: pick using on-disk history and the analytics module if present. */
function pickForToday(opts = {}) {
  return pickScenario({
    ...opts,
    history: opts.history || loadHistory(),
    formatWeights:
      opts.formatWeights === undefined
        ? loadFormatWeights()
        : opts.formatWeights,
  });
}

module.exports = { pickScenario, pickForToday, DEFAULTS };
