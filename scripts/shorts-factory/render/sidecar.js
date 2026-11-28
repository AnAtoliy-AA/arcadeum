'use strict';

const fs = require('fs');
const { isLengthClass } = require('../length/classes');

/**
 * Scenario sidecar written by scenarios/gameplay-flow.js (`<video>.scenario.json`):
 * { hook, voiceScript, dramaticMomentSec, lengthClass, ... }. Optional: returns null if absent.
 */
function sidecarPathFor(videoPath) {
  return `${String(videoPath).replace(/\.[^.]+$/, '')}.scenario.json`;
}

function loadSidecar(pathOrVideo) {
  const candidates = [pathOrVideo, sidecarPathFor(pathOrVideo)];
  for (const file of candidates) {
    if (!file || !file.endsWith('.json')) continue;
    try {
      return normalizeSidecar(JSON.parse(fs.readFileSync(file, 'utf8')));
    } catch {}
  }
  return null;
}

function normalizeSidecar(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const sec = raw.dramaticMomentSec;
  return {
    id: raw.id,
    hook: typeof raw.hook === 'string' ? raw.hook : undefined,
    voiceScript:
      typeof raw.voiceScript === 'string' ? raw.voiceScript : undefined,
    dramaticMomentMs:
      typeof sec === 'number' && Number.isFinite(sec) && sec > 0
        ? sec * 1000
        : undefined,
    lengthClass: isLengthClass(raw.lengthClass) ? raw.lengthClass : undefined,
  };
}

/** Merge sidecar hints into render options without overriding explicit ones. */
function applySidecar(opts, sidecar) {
  if (!sidecar) return opts;
  const scenarioName =
    typeof opts.scenario === 'object' && opts.scenario
      ? opts.scenario.name
      : opts.scenario;
  return {
    ...opts,
    scenario: {
      name: scenarioName || sidecar.id,
      hook:
        (typeof opts.scenario === 'object' && opts.scenario?.hook) ||
        sidecar.hook,
    },
    caption: opts.caption || sidecar.voiceScript,
    // Length class (see ../length): sets the QA range and, for medium and up,
    // the structured script replaces the caption body. Short keeps the legacy path.
    lengthClass: opts.lengthClass ?? sidecar.lengthClass,
    voiceScript:
      opts.voiceScript ??
      (sidecar.lengthClass && sidecar.lengthClass !== 'short'
        ? sidecar.voiceScript
        : undefined),
    dramaticMomentMs: opts.dramaticMomentMs ?? sidecar.dramaticMomentMs,
  };
}

module.exports = {
  sidecarPathFor,
  loadSidecar,
  normalizeSidecar,
  applySidecar,
};
