'use strict';

/**
 * Scene pacing derived from a scenario's beat timeline (see length/structure.js).
 * `short` keeps the original tuned pacing. Longer classes spend the extra time
 * on content, not padding: hints that appear one by one during the build-up,
 * a longer fast-forward through the real moves, and a slower, longer reveal.
 */

const LEGACY_PUZZLE = {
  setupMs: 0,
  count: 5,
  hints: [],
  slowMs: 2200,
  endMs: 1500,
};
const LEGACY_REPLAY = {
  lead: 4,
  introMs: 1200,
  buildMs: 720,
  hints: [],
  keyMs: 2400,
  afterMs: 260,
  endMs: 1500,
};

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function beatMs(scenario, id) {
  const b = (scenario.beats || []).find((x) => x.id === id);
  return b ? Math.round((b.endSec - b.startSec) * 1000) : 0;
}

function beatLines(scenario, id) {
  const b = (scenario.beats || []).find((x) => x.id === id);
  return b ? b.lines || [] : [];
}

/** Short hint labels shown on screen (the voice says the long version). */
function hintLabels(scenario) {
  return beatLines(scenario, 'build_up').map((l) =>
    l.replace(/[.!?]+$/, '').slice(0, 60),
  );
}

function usesBeats(scenario) {
  return Boolean(scenario.beats) && scenario.lengthClass !== 'short';
}

/** Puzzle / guess_the_move: setup, countdown with hints, slow reveal, recap. */
function puzzleTiming(scenario) {
  if (!usesBeats(scenario)) return { ...LEGACY_PUZZLE };
  const tail = beatMs(scenario, 'recap') + beatMs(scenario, 'resolution');
  return {
    setupMs: beatMs(scenario, 'setup'),
    count: clamp(Math.round(beatMs(scenario, 'build_up') / 1000), 5, 60),
    hints: hintLabels(scenario),
    slowMs: Math.max(2200, beatMs(scenario, 'reveal') - 1800),
    endMs: Math.max(1500, tail + 1500),
  };
}

/** Replay highlights: longer fast-forward lead-in and a longer key moment. */
function replayTiming(scenario) {
  if (!usesBeats(scenario)) return { ...LEGACY_REPLAY, hints: [] };
  const LEAD = { medium: 10, long: 18, feature: 30 };
  const tail = beatMs(scenario, 'recap') + beatMs(scenario, 'resolution');
  return {
    lead: LEAD[scenario.lengthClass] || 4,
    introMs: Math.max(1200, beatMs(scenario, 'setup')),
    buildMs: beatMs(scenario, 'build_up'),
    hints: hintLabels(scenario),
    keyMs: Math.max(2400, beatMs(scenario, 'reveal') - 1500),
    afterMs: 400,
    endMs: Math.max(1500, tail),
  };
}

/** Longest a capture may run before it is considered stuck. */
function captureMaxMs(scenario) {
  const { LENGTH_CLASSES } = require('../length/classes');
  const cls = LENGTH_CLASSES[scenario.lengthClass];
  return ((cls ? cls.maxSec : 25) + 25) * 1000;
}

module.exports = { puzzleTiming, replayTiming, captureMaxMs };
