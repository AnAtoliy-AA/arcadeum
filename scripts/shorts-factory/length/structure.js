'use strict';

const {
  LENGTH_CLASSES,
  FORMAT_LENGTHS,
  HOOK_MAX_SEC,
  HOOK_WORDS_PER_SEC,
  WORDS_PER_SEC,
} = require('./classes');
const { BEAT_LINES, LINE_COUNTS } = require('./beat-lines');

/**
 * Story structure of a video: hook, setup, build_up, reveal (payoff), then
 * the CTA. Features add a resolution after the climax; long videos add a recap.
 * Weights share the time between the hook and the CTA.
 */
const BEAT_WEIGHTS = {
  short: { setup: 0, build_up: 0, reveal: 1, recap: 0, resolution: 0 },
  medium: { setup: 2, build_up: 4, reveal: 2.5, recap: 1, resolution: 0 },
  long: { setup: 3, build_up: 7, reveal: 3.5, recap: 1.5, resolution: 0 },
  feature: { setup: 3, build_up: 7, reveal: 3, recap: 0, resolution: 2 },
};
const BEAT_ORDER = ['setup', 'build_up', 'reveal', 'recap', 'resolution'];
const CTA_SEC = { short: 2.5, medium: 3, long: 3, feature: 4 };

const round3 = (n) => Math.round(n * 1000) / 1000;

function countWords(text) {
  return String(text).split(/\s+/).filter(Boolean).length;
}

/** Rough spoken duration of a text at the normal pace. */
function estimateSpeechSec(text) {
  return countWords(text) / WORDS_PER_SEC;
}

/**
 * Short punchy line spoken in the first 1.5s. Prefers a clause that ends at
 * punctuation inside the word budget, otherwise the first words.
 */
function spokenHook(hook) {
  const maxWords = Math.floor(HOOK_MAX_SEC * HOOK_WORDS_PER_SEC);
  const text = String(hook).replace(/\s+/g, ' ').trim();
  const words = text.split(' ');
  if (words.length <= maxWords) return text.replace(/[.,:;]+$/, '');
  const head = words.slice(0, maxWords);
  let cut = -1;
  head.forEach((w, i) => {
    if (/[.,:;!?]$/.test(w)) cut = i;
  });
  const chosen = cut >= 1 ? head.slice(0, cut + 1) : head;
  return chosen.join(' ').replace(/[.,:;]+$/, '');
}

function hookSpeechSec(hook) {
  return countWords(hook) / HOOK_WORDS_PER_SEC;
}

/**
 * Timeline for one video: [{ id, startSec, endSec }]. The hook always ends by
 * 1.5s, the CTA owns the last seconds, the beats share the rest by weight.
 */
function planBeats(lengthClass, totalSec) {
  const cls = LENGTH_CLASSES[lengthClass];
  if (!cls) throw new Error(`Unknown length class: ${lengthClass}`);
  const total = totalSec || cls.targetSec;
  const cta = CTA_SEC[lengthClass];
  const weights = BEAT_WEIGHTS[lengthClass];
  const ids = BEAT_ORDER.filter((id) => weights[id] > 0);
  const middle = total - HOOK_MAX_SEC - cta;
  const sum = ids.reduce((a, id) => a + weights[id], 0);
  const beats = [{ id: 'hook', startSec: 0, endSec: HOOK_MAX_SEC }];
  let t = HOOK_MAX_SEC;
  for (const id of ids) {
    const end = t + (weights[id] / sum) * middle;
    beats.push({ id, startSec: round3(t), endSec: round3(end) });
    t = end;
  }
  beats.push({ id: 'cta', startSec: round3(t), endSec: round3(total) });
  return beats;
}

function pick(list, n) {
  return list.slice(0, Math.min(n, list.length));
}

/**
 * Compose the structured voice lines for a class. Returns null for `short`
 * (callers keep the legacy one-liner voice) or when the format has no lines.
 */
function composeBeatLines({ format, lengthClass, label }) {
  const pool = BEAT_LINES[format];
  const counts = LINE_COUNTS[lengthClass];
  if (!pool || !counts || lengthClass === 'short') return null;
  const fill = (s) => s.replace(/\{game\}/g, label);
  const out = {};
  for (const id of BEAT_ORDER) {
    out[id] = pick(pool[id] || [], counts[id]).map(fill);
  }
  return out;
}

/** Flatten composed lines: spoken hook, then beats in order. */
function buildStructuredVoice({ hook, spoken, beatLines }) {
  const lines = [spoken || spokenHook(hook)];
  for (const id of BEAT_ORDER) lines.push(...(beatLines[id] || []));
  return lines.map((l) => (/[.!?]$/.test(l) ? l : `${l}.`)).join(' ');
}

/** Attach lines to the timeline, for the recording step and the sidecar. */
function withLines(beats, beatLines) {
  return beats.map((b) => ({
    ...b,
    lines: (beatLines && beatLines[b.id]) || [],
  }));
}

function isStructured(format, lengthClass) {
  return (
    lengthClass !== 'short' &&
    !!BEAT_LINES[format] &&
    (FORMAT_LENGTHS[format] || []).includes(lengthClass)
  );
}

module.exports = {
  BEAT_ORDER,
  CTA_SEC,
  planBeats,
  composeBeatLines,
  buildStructuredVoice,
  withLines,
  isStructured,
  spokenHook,
  hookSpeechSec,
  estimateSpeechSec,
  countWords,
};
