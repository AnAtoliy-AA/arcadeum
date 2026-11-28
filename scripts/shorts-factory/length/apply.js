'use strict';

const { LENGTH_CLASSES, allowedLengths, defaultLength } = require('./classes');
const {
  planBeats,
  composeBeatLines,
  buildStructuredVoice,
  withLines,
  isStructured,
  spokenHook,
} = require('./structure');

/**
 * Return `scenario` re-shaped for a length class: target duration, beat
 * timeline (hook by 1.5s, setup, build_up, reveal, CTA), and for medium, long
 * and feature a structured voice script. `short` keeps the legacy voice.
 */
function applyLength(scenario, lengthClass, { label, spoken } = {}) {
  const cls =
    lengthClass && allowedLengths(scenario.format).includes(lengthClass)
      ? lengthClass
      : defaultLength(scenario.format);
  const range = LENGTH_CLASSES[cls];
  let beatLines = null;
  let voiceScript = scenario.voiceScript;
  if (isStructured(scenario.format, cls)) {
    beatLines = composeBeatLines({
      format: scenario.format,
      lengthClass: cls,
      label: label || scenario.game,
    });
    voiceScript = buildStructuredVoice({
      hook: scenario.hook,
      spoken,
      beatLines,
    });
  }
  const beats = withLines(planBeats(cls, range.targetSec), beatLines);
  const out = {
    ...scenario,
    lengthClass: cls,
    durationSec: range.targetSec,
    beats,
    voiceScript,
  };
  if (beatLines) out.spokenHook = spoken || spokenHook(scenario.hook);
  else delete out.spokenHook;
  return out;
}

module.exports = { applyLength };
