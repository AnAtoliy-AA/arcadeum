'use strict';

/**
 * Video length classes. The allowed duration is a per-format setting: every
 * format lists the classes it supports (first entry is its default) and the
 * QA gate, scenario schema, picker and recording pacing all read from here.
 *
 *  - short:   ~15-25s, one idea, hook then payoff
 *  - medium:  ~35-50s, a real setup and build-up before the reveal
 *  - long:    ~60-90s, several build-up beats, a reveal and a recap
 *  - feature: 2-3 min weekly story for YouTube only (never picked by default)
 */
const LENGTH_CLASSES = {
  short: { id: 'short', minSec: 15, maxSec: 25, targetSec: 20 },
  medium: { id: 'medium', minSec: 35, maxSec: 50, targetSec: 42 },
  long: { id: 'long', minSec: 60, maxSec: 90, targetSec: 75 },
  feature: { id: 'feature', minSec: 120, maxSec: 180, targetSec: 150 },
};

/** Classes the daily picker may assign (feature is opt-in only). */
const DAILY_CLASSES = ['short', 'medium', 'long'];

const FEATURE_FORMAT = 'feature_story';

/** Allowed length classes per format, default first. */
const FORMAT_LENGTHS = {
  bot_match: ['short', 'medium'],
  guess_the_move: ['short'],
  puzzle: ['medium', 'short', 'long'],
  comeback: ['medium', 'long'],
  last_second_win: ['short', 'medium'],
  replay_highlight: ['medium', 'long'],
  [FEATURE_FORMAT]: ['feature'],
};

/** The hook (on screen at frame 0 and first spoken words) must land by here. */
const HOOK_MAX_SEC = 1.5;

/** Fast TTS delivery used to budget the spoken hook (words per second). */
const HOOK_WORDS_PER_SEC = 3.4;

/** Average spoken pace used to budget script length (words per second). */
const WORDS_PER_SEC = 2.9;

function isLengthClass(id) {
  return Object.prototype.hasOwnProperty.call(LENGTH_CLASSES, id);
}

function allowedLengths(format) {
  return FORMAT_LENGTHS[format] || ['short'];
}

function defaultLength(format) {
  return allowedLengths(format)[0];
}

function lengthRange(id) {
  const c = LENGTH_CLASSES[id];
  if (!c) throw new Error(`Unknown length class: ${id}`);
  return { minSec: c.minSec, maxSec: c.maxSec, targetSec: c.targetSec };
}

/** The class whose range contains `sec`, or null (e.g. 28s is in no class). */
function classifyDuration(sec) {
  if (!(typeof sec === 'number' && Number.isFinite(sec))) return null;
  const hit = Object.values(LENGTH_CLASSES).find(
    (c) => sec >= c.minSec && sec <= c.maxSec,
  );
  return hit ? hit.id : null;
}

function isWithinClass(sec, id) {
  if (!isLengthClass(id)) return false;
  const { minSec, maxSec } = LENGTH_CLASSES[id];
  return typeof sec === 'number' && sec >= minSec && sec <= maxSec;
}

module.exports = {
  LENGTH_CLASSES,
  DAILY_CLASSES,
  FEATURE_FORMAT,
  FORMAT_LENGTHS,
  HOOK_MAX_SEC,
  HOOK_WORDS_PER_SEC,
  WORDS_PER_SEC,
  isLengthClass,
  allowedLengths,
  defaultLength,
  lengthRange,
  classifyDuration,
  isWithinClass,
};
