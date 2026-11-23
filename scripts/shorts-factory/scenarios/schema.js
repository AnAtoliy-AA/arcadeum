'use strict';

const { FORMATS } = require('./constants');

const EM_DASH = /—/;
const LIMITS = { hook: 80, voiceScript: 300, caption: 2200 };

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
 *   durationSec, payload?
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
  str('voiceScript', LIMITS.voiceScript);
  str('caption', LIMITS.caption);
  if (!FORMATS.includes(s.format))
    errors.push(`format must be one of ${FORMATS.join(', ')}`);
  if (!Number.isInteger(s.seed)) errors.push('seed must be an integer');
  if (!(Number.isFinite(s.durationSec) && s.durationSec > 0)) {
    errors.push('durationSec must be a positive number');
  }

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

function assertScenario(s) {
  const { valid, errors } = validateScenario(s);
  if (!valid)
    throw new Error(`Invalid scenario ${s && s.id}: ${errors.join('; ')}`);
  return s;
}

module.exports = { validateScenario, assertScenario, LIMITS };
