'use strict';

const { FORMATS } = require('./constants');
const {
  LENGTH_CLASSES,
  HOOK_MAX_SEC,
  allowedLengths,
  isLengthClass,
} = require('../length/classes');
const {
  CTA_SEC,
  estimateSpeechSec,
  hookSpeechSec,
} = require('../length/structure');

const EM_DASH = /—/;
const LIMITS = { hook: 80, voiceScript: 300, caption: 2200 };
/** Longer videos carry more spoken lines. */
const VOICE_LIMITS = { short: 300, medium: 700, long: 1200, feature: 2600 };

/**
 * A scenario describes ONE short video.
 *
 * {
 *   id, game, format, theme, seed,
 *   hook:        opening line shown in the first second (max 80 chars),
 *   voiceScript: text for edge-tts (max 300 chars),
 *   caption:     post caption,
 *   dramaticMoment: { type: 'step' | 'timestamp', value: number >= 0, label? }
 *                   the instant worker A's render should open on,
 *   lengthClass: 'short' | 'medium' | 'long' | 'feature', must be allowed for the
 *                format (see length/classes.js FORMAT_LENGTHS),
 *   durationSec: target length, inside the class range,
 *   beats?:      [{ id, startSec, endSec, lines }] hook (ends by 1.5s), setup,
 *                build_up, reveal, ..., cta; contiguous and ending at durationSec,
 *   spokenHook?: first spoken words, must fit in 1.5s,
 *   payload?
 * }
 */
function validateScenario(s) {
  const errors = [];
  if (!s || typeof s !== 'object')
    return { valid: false, errors: ['not an object'] };

  const str = (key, max) => {
    if (typeof s[key] !== 'string' || s[key].trim() === '') {
      errors.push(`${key} must be a non-empty string`);
    } else {
      if (max && s[key].length > max)
        errors.push(`${key} exceeds ${max} chars`);
      if (EM_DASH.test(s[key]))
        errors.push(`${key} must not contain an em dash`);
    }
  };

  str('id');
  str('game');
  str('theme');
  str('hook', LIMITS.hook);
  const cls = isLengthClass(s.lengthClass) ? s.lengthClass : 'short';
  str('voiceScript', VOICE_LIMITS[cls]);
  str('caption', LIMITS.caption);
  if (!FORMATS.includes(s.format))
    errors.push(`format must be one of ${FORMATS.join(', ')}`);
  if (!Number.isInteger(s.seed)) errors.push('seed must be an integer');
  if (!(Number.isFinite(s.durationSec) && s.durationSec > 0)) {
    errors.push('durationSec must be a positive number');
  }

  validateLength(s, errors);

  const d = s.dramaticMoment;
  if (!d || typeof d !== 'object') {
    errors.push('dramaticMoment is required');
  } else {
    if (d.type !== 'step' && d.type !== 'timestamp') {
      errors.push("dramaticMoment.type must be 'step' or 'timestamp'");
    }
    if (!(Number.isFinite(d.value) && d.value >= 0)) {
      errors.push('dramaticMoment.value must be a number >= 0');
    }
  }
  return { valid: errors.length === 0, errors };
}

function validateLength(s, errors) {
  if (!isLengthClass(s.lengthClass)) {
    errors.push(
      `lengthClass must be one of ${Object.keys(LENGTH_CLASSES).join(', ')}`,
    );
    return;
  }
  if (
    FORMATS.includes(s.format) &&
    !allowedLengths(s.format).includes(s.lengthClass)
  ) {
    errors.push(
      `lengthClass ${s.lengthClass} is not allowed for ${s.format} (allowed: ${allowedLengths(s.format).join(', ')})`,
    );
  }
  const range = LENGTH_CLASSES[s.lengthClass];
  if (
    Number.isFinite(s.durationSec) &&
    (s.durationSec < range.minSec || s.durationSec > range.maxSec)
  ) {
    errors.push(
      `durationSec ${s.durationSec} outside ${s.lengthClass} range ${range.minSec}-${range.maxSec}s`,
    );
  }
  if (
    typeof s.voiceScript === 'string' &&
    estimateSpeechSec(s.voiceScript) > range.maxSec - CTA_SEC[s.lengthClass]
  ) {
    errors.push('voiceScript is too long for the length class');
  }
  if (
    s.spokenHook !== undefined &&
    hookSpeechSec(s.spokenHook) > HOOK_MAX_SEC
  ) {
    errors.push(`spokenHook must be speakable within ${HOOK_MAX_SEC}s`);
  }
  if (s.beats !== undefined) validateBeats(s, errors);
}

function validateBeats(s, errors) {
  const beats = s.beats;
  if (!Array.isArray(beats) || beats.length < 2) {
    errors.push('beats must list at least hook and cta');
    return;
  }
  const first = beats[0];
  const last = beats[beats.length - 1];
  if (first.id !== 'hook' || first.startSec !== 0) {
    errors.push('first beat must be the hook starting at 0s');
  } else if (first.endSec > HOOK_MAX_SEC) {
    errors.push(`hook beat must end within ${HOOK_MAX_SEC}s`);
  }
  if (last.id !== 'cta') errors.push('last beat must be the cta');
  if (Math.abs(last.endSec - s.durationSec) > 0.01) {
    errors.push('beats must end at durationSec');
  }
  for (let i = 1; i < beats.length; i++) {
    if (Math.abs(beats[i].startSec - beats[i - 1].endSec) > 0.01) {
      errors.push(
        `beat ${beats[i].id} is not contiguous with the previous beat`,
      );
    }
  }
  if (s.lengthClass !== 'short' && !beats.some((b) => b.id === 'reveal')) {
    errors.push('long form scenarios need a reveal beat');
  }
}

function assertScenario(s) {
  const { valid, errors } = validateScenario(s);
  if (!valid)
    throw new Error(`Invalid scenario ${s && s.id}: ${errors.join('; ')}`);
  return s;
}

module.exports = { validateScenario, assertScenario, LIMITS, VOICE_LIMITS };
