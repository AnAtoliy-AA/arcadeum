'use strict';

/**
 * Shared constants for the render pipeline. Pure data, no side effects.
 * Env toggles are read lazily through helpers so tests can override them.
 */

const { lengthRange } = require('../length/classes');

const VIDEO = { width: 1080, height: 1920, fps: 30 };

/** Platform UI covers the top ~12% and bottom ~20% of a 9:16 frame. */
const SAFE_ZONE = { topPct: 0.12, bottomPct: 0.2, sidePct: 0.06 };

const DURATION = {
  minTotalSec: 15,
  maxTotalSec: 30,
  minMainSec: 12,
  maxMainSec: 24,
  endCardSec: 3,
  voiceLeadInSec: 0.25,
  voiceTailSec: 1.2,
};

/**
 * Duration bounds for a length class (see ../length/classes.js), or the legacy
 * 15-30s window when no class is given (showcase factory).
 * Main segment = total minus the end card.
 */
function durationBounds(lengthClass) {
  if (!lengthClass) {
    return {
      minTotalSec: DURATION.minTotalSec,
      maxTotalSec: DURATION.maxTotalSec,
      minMainSec: DURATION.minMainSec,
      maxMainSec: DURATION.maxMainSec,
    };
  }
  const { minSec, maxSec } = lengthRange(lengthClass);
  return {
    minTotalSec: minSec,
    maxTotalSec: maxSec,
    minMainSec: minSec - DURATION.endCardSec,
    maxMainSec: maxSec - DURATION.endCardSec,
  };
}

const LOUDNESS = {
  targetLufs: -14,
  truePeakDb: -1.5,
  lra: 11,
  /** QA accepts the measured integrated loudness inside this window. */
  minLufs: -18,
  maxLufs: -10,
};

const MUSIC = {
  baseVolume: 0.35,
  /** Sidechain ducking while the voice speaks. */
  duck: { threshold: 0.03, ratio: 10, attackMs: 15, releaseMs: 450 },
};

const SITE = { name: 'arcadeum.games', url: 'https://arcadeum.games' };

const CTA_VARIANTS = [
  { id: 'A', text: 'Play free, no download' },
  { id: 'B', text: 'Free in your browser, play now' },
];

const HOOK_WINDOW_SEC = 2.6;

function envFlag(name, fallback, env = process.env) {
  const v = env[name];
  if (v === undefined || v === '') return fallback;
  return !['false', '0', 'off', 'no'].includes(String(v).toLowerCase());
}

module.exports = {
  VIDEO,
  SAFE_ZONE,
  DURATION,
  durationBounds,
  LOUDNESS,
  MUSIC,
  SITE,
  CTA_VARIANTS,
  HOOK_WINDOW_SEC,
  envFlag,
};
