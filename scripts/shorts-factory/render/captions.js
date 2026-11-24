'use strict';

/**
 * Pure caption logic: splitting a voice script into short punchy lines,
 * turning measured line durations into word-level timings, and building the
 * "states" (one per active word) that get burned in as overlay images.
 */

const SPLIT_PUNCT = /([.!?;:]+)/;

function cleanScript(text) {
  return String(text || '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/#\S+/g, '')
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/[—–]/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split into short spoken lines (<= maxWords words, <= maxChars chars).
 * Sentences split first, then long sentences split at commas, then by size.
 */
function splitIntoLines(text, { maxWords = 5, maxChars = 30 } = {}) {
  const clean = cleanScript(text);
  if (!clean) return [];
  const sentences = [];
  const parts = clean.split(SPLIT_PUNCT);
  for (let i = 0; i < parts.length; i += 2) {
    const body = (parts[i] || '').trim();
    if (!body) continue;
    sentences.push(`${body}${parts[i + 1] || ''}`.trim());
  }
  const lines = [];
  for (const sentence of sentences) {
    for (const chunk of sentence.split(/(?<=,)\s+/)) {
      let current = [];
      const flush = () => {
        if (current.length) lines.push(current.join(' '));
        current = [];
      };
      for (const word of chunk.split(' ').filter(Boolean)) {
        const next = [...current, word];
        if (
          current.length &&
          (next.length > maxWords || next.join(' ').length > maxChars)
        ) {
          flush();
        }
        current.push(word);
      }
      flush();
    }
  }
  return lines;
}

/** Relative time weight of a word: longer words and trailing punctuation last longer. */
function wordWeight(word) {
  const letters = word.replace(/[^\p{L}\p{N}]/gu, '').length || 1;
  const pause = /[.!?]$/.test(word) ? 0.8 : /[,;:]$/.test(word) ? 0.4 : 0;
  return letters + 1 + pause * 3;
}

/**
 * lines: [{text, start, end}] in seconds on the final timeline.
 * Returns flat [{text, start, end, lineIndex, wordIndex}] with words filling
 * their line's span exactly.
 */
function buildWordTimings(lines) {
  const words = [];
  lines.forEach((line, lineIndex) => {
    const tokens = line.text.split(/\s+/).filter(Boolean);
    const total = tokens.reduce((s, w) => s + wordWeight(w), 0) || 1;
    const span = Math.max(0, line.end - line.start);
    let cursor = line.start;
    tokens.forEach((text, wordIndex) => {
      const dur = (wordWeight(text) / total) * span;
      words.push({
        text,
        start: cursor,
        end: cursor + dur,
        lineIndex,
        wordIndex,
      });
      cursor += dur;
    });
  });
  return words;
}

/**
 * One state per word: the whole line is visible, the active word highlighted.
 * Each state spans from the word start to the next word start (or its own
 * end), so the line stays on screen with no flicker between words.
 */
function buildCaptionStates(lines) {
  const words = buildWordTimings(lines);
  const states = [];
  words.forEach((w, i) => {
    const next = words[i + 1];
    const sameLine = next && next.lineIndex === w.lineIndex;
    const end = sameLine ? next.start : w.end;
    if (end - w.start < 0.02) return;
    const lineWords = words.filter((x) => x.lineIndex === w.lineIndex);
    states.push({
      start: round3(w.start),
      end: round3(end),
      lineIndex: w.lineIndex,
      activeIndex: w.wordIndex,
      words: lineWords.map((x) => x.text),
    });
  });
  return states;
}

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

/** Place sequential line durations on a timeline with `gapSec` pauses between. */
function placeLines(durations, texts, { startSec = 0, gapSec = 0.18 } = {}) {
  let cursor = startSec;
  return texts.map((text, i) => {
    const line = {
      text,
      start: round3(cursor),
      end: round3(cursor + durations[i]),
    };
    cursor += durations[i] + gapSec;
    return line;
  });
}

module.exports = {
  cleanScript,
  splitIntoLines,
  wordWeight,
  buildWordTimings,
  buildCaptionStates,
  placeLines,
  round3,
};
