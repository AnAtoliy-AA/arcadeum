'use strict';

const { cleanScript } = require('./captions');
const { DURATION } = require('./config');

const SCENARIO_HOOKS = [
  ['chess', 'Can you beat Stockfish?'],
  ['seabattle', 'Sink the whole fleet'],
  ['critical', 'One wrong card and you are out'],
  ['tournament', 'Win the tournament live'],
  ['leaderboard', 'Climb the global ranks'],
  ['glimworm', 'Neon snake battle'],
  ['tictactoe', 'Tic-tac-toe with stakes'],
  ['checkers', 'Checkers but ranked'],
  ['backgammon', 'Backgammon, but online'],
  ['shop', 'Unlock rare skins'],
  ['avatar', 'Unlock rare skins'],
  ['catalog', '15+ free multiplayer games'],
];

const DEFAULT_HOOK = 'Free games, real players';

/**
 * Pick the on-screen hook line (max 6 words, 34 chars).
 * Priority: scenario.hook (provided by gameplay scenarios) > scenario name
 * map > first sentence of the caption > default.
 */
function deriveHook({ scenario, caption } = {}) {
  const provided =
    scenario && typeof scenario === 'object' ? scenario.hook : null;
  const name = String(
    (scenario && (scenario.name || scenario)) || '',
  ).toLowerCase();
  let raw = typeof provided === 'string' && provided.trim() ? provided : null;
  if (!raw) {
    const hit = SCENARIO_HOOKS.find(([key]) => name.includes(key));
    if (hit) raw = hit[1];
  }
  if (!raw && caption) {
    raw = cleanScript(caption).split(/[.!?]/)[0];
  }
  return clampHook(raw || DEFAULT_HOOK);
}

function clampHook(text, { maxWords = 6, maxChars = 34 } = {}) {
  const words = cleanScript(text).split(' ').filter(Boolean).slice(0, maxWords);
  let out = words.join(' ');
  while (out.length > maxChars && words.length > 1) {
    words.pop();
    out = words.join(' ');
  }
  return out.slice(0, maxChars).replace(/[,;:]+$/, '') || DEFAULT_HOOK;
}

/**
 * Where to start the trim. A scenario may report `dramaticMomentMs` (offset in
 * the raw recording of its most dramatic moment); we start ~0.6s before it,
 * but only when enough footage remains to fill the minimum main segment.
 */
function pickStartOffsetSec({
  startOffsetMs = 0,
  recordedDurationMs,
  dramaticMomentMs,
  minMainSec = DURATION.minMainSec,
}) {
  const base = Math.max(0, startOffsetMs / 1000);
  if (typeof dramaticMomentMs !== 'number' || !(dramaticMomentMs > 0)) {
    return { startSec: base, usedDramatic: false };
  }
  const candidate = Math.max(base, dramaticMomentMs / 1000 - 0.6);
  const remaining = recordedDurationMs / 1000 - candidate;
  if (remaining < Math.min(minMainSec, 8)) {
    return { startSec: base, usedDramatic: false };
  }
  return { startSec: candidate, usedDramatic: true };
}

module.exports = { deriveHook, clampHook, pickStartOffsetSec, DEFAULT_HOOK };
