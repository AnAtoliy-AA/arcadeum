'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_FILE = path.join(
  __dirname,
  '..',
  '.state',
  'scenario-history.json',
);
const MAX_ENTRIES = 200;

function historyFile() {
  return process.env.SHORTS_SCENARIO_HISTORY_FILE || DEFAULT_FILE;
}

/** Entries: [{ date: 'YYYY-MM-DD', scenarioId, game, format, theme, lengthClass, durationSec }] newest last. */
function loadHistory(file = historyFile()) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(parsed.entries) ? parsed.entries : [];
  } catch {
    return [];
  }
}

/** `extra.actualDurationSec` is the measured length of the rendered video. */
function recordScenario(scenario, date, file = historyFile(), extra = {}) {
  const entries = loadHistory(file).filter(
    (e) => !(e.date === date && e.scenarioId === scenario.id),
  );
  entries.push({
    date,
    scenarioId: scenario.id,
    game: scenario.game,
    format: scenario.format,
    theme: scenario.theme,
    lengthClass: scenario.lengthClass || null,
    durationSec: scenario.durationSec || null,
    actualDurationSec:
      typeof extra.actualDurationSec === 'number'
        ? extra.actualDurationSec
        : null,
  });
  const trimmed = entries.slice(-MAX_ENTRIES);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ entries: trimmed }, null, 2));
  return trimmed;
}

module.exports = { loadHistory, recordScenario, historyFile, DEFAULT_FILE };
