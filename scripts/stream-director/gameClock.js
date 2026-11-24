'use strict';

const crypto = require('crypto');

/**
 * Decide what to do with the running game. Pure: all inputs explicit so the
 * "games always end" guarantee is unit-testable.
 *
 * Verdicts: 'continue' | 'finished' | 'timeout' | 'stuck' | 'error'
 */
function evaluateGame({
  now,
  startedAt,
  maxDurationMs,
  stuckMs,
  lastChangeAt,
  completed = false,
  consecutiveErrors = 0,
  maxErrors = 5,
}) {
  if (completed) return { verdict: 'finished' };
  if (now - startedAt >= maxDurationMs) return { verdict: 'timeout' };
  if (consecutiveErrors >= maxErrors) return { verdict: 'error' };
  if (now - lastChangeAt >= stuckMs) return { verdict: 'stuck' };
  return { verdict: 'continue' };
}

/** Stable fingerprint of a session payload, used to notice "no progress". */
function sessionSignature(session) {
  if (!session) return 'none';
  const basis = session.updatedAt ?? session.state ?? session;
  return crypto
    .createHash('sha1')
    .update(typeof basis === 'string' ? basis : JSON.stringify(basis))
    .digest('hex');
}

/** True when API payloads say the game is over. */
function isCompleted({ room, session } = {}) {
  return room?.status === 'completed' || session?.status === 'completed';
}

module.exports = { evaluateGame, sessionSignature, isCompleted };
