'use strict';

const path = require('path');
const { PUZZLE_FORMATS, REPLAY_FORMATS } = require('./constants');
const { fetchPuzzle } = require('./puzzles');
const { findReplayFor, replaysAvailable } = require('./replay-source');
const { puzzleScene, replayScene } = require('./scene-html');
const { captureScene } = require('./capture');
const { buildScenario } = require('./library');
const { assertScenario } = require('./schema');
const { captureMaxMs } = require('./timing');
const { FEATURE_FORMAT } = require('../length/classes');

/** Backend API base for puzzle/replay reads. Never contains credentials. */
function apiBaseFrom(env = process.env) {
  return env.SHORTS_API_URL || env.NEXT_PUBLIC_API_URL || env.API_URL || '';
}

/** Probe what data exists so the picker only offers feasible formats. */
async function probeAvailability({ baseApiUrl = apiBaseFrom(), http } = {}) {
  const replay = baseApiUrl
    ? await replaysAvailable({ baseApiUrl, http }).catch(() => false)
    : false;
  return { replay, puzzle: true }; // puzzles always have the bundled fallback
}

/**
 * Resolve the data a scenario needs and build its scene. Returns
 * { scenario, html } or null when the format is bot_match (recorded live by
 * gameplay.js). If replay data vanished since the probe, the scenario falls
 * back to a bot_match of the same game so a short is always produced.
 */
async function prepareScenario(
  scenario,
  { baseApiUrl = apiBaseFrom(), http } = {},
) {
  assertScenario(scenario);
  if (PUZZLE_FORMATS.has(scenario.format)) {
    const puzzle = await fetchPuzzle({
      baseApiUrl,
      seed: scenario.seed,
      minSolverMoves: scenario.format === 'puzzle' ? 1 : 1,
      http,
    });
    return {
      scenario,
      html: puzzleScene({ scenario, puzzle }),
      data: { puzzle },
    };
  }
  // The weekly feature tells a real match as a story; without replay data it
  // is recorded live by gameplay.js with the same structure and length.
  if (
    REPLAY_FORMATS.has(scenario.format) ||
    scenario.format === FEATURE_FORMAT
  ) {
    const found = await findReplayFor({
      format:
        scenario.format === FEATURE_FORMAT
          ? 'replay_highlight'
          : scenario.format,
      gameId: scenario.gameId,
      baseApiUrl,
      http,
    });
    if (!found && scenario.format === FEATURE_FORMAT) {
      return { scenario, html: null, data: null, fellBack: true };
    }
    if (!found) {
      const fallback = {
        ...buildScenario(
          scenario.game,
          'bot_match',
          scenario.theme,
          scenario.lengthClass,
        ),
        seed: scenario.seed,
      };
      return { scenario: fallback, html: null, data: null, fellBack: true };
    }
    const dramaticMoment = {
      type: 'step',
      value: found.moment.step,
      label: found.moment.label,
    };
    const resolved = { ...scenario, dramaticMoment };
    return {
      scenario: resolved,
      html: replayScene({
        scenario: resolved,
        replay: found.replay,
        moment: found.moment,
      }),
      data: found,
    };
  }
  return { scenario, html: null, data: null };
}

/** Record a prepared scene to disk. */
async function recordPrepared(prepared, { outDir, log, chromium } = {}) {
  if (!prepared.html)
    throw new Error('bot_match scenarios are recorded by gameplay.js');
  const res = await captureScene({
    html: prepared.html,
    maxMs: captureMaxMs(prepared.scenario),
    outDir: outDir || path.join(__dirname, '..', '..', '..', 'raw_captures'),
    log,
    chromium,
  });
  return { ...res, scenario: prepared.scenario };
}

module.exports = {
  prepareScenario,
  recordPrepared,
  probeAvailability,
  apiBaseFrom,
};
