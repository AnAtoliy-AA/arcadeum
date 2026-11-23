'use strict';

/** Pure voice selection and tuning. */

const DEFAULT_VOICES = [
  'en-US-GuyNeural',
  'en-US-AriaNeural',
  'en-US-ChristopherNeural',
  'en-US-JennyNeural',
  'en-US-AndrewNeural',
  'en-US-EmmaNeural',
  'en-US-BrianNeural',
  'en-US-AvaNeural',
];

const RATES = ['+6%', '+10%', '+14%'];
const PITCHES = ['+0Hz', '+2Hz', '+4Hz'];

function parseVoiceList(env = process.env) {
  const list = (env.EDGE_TTS_VOICES || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  return list.length ? list : DEFAULT_VOICES;
}

/**
 * Pick a voice + tuning. EDGE_TTS_VOICE pins a single voice (old behavior);
 * otherwise rotate by day, then by an optional `offset` (retry/regeneration).
 * EDGE_TTS_RATE / EDGE_TTS_PITCH pin the tuning.
 */
function pickVoice({ env = process.env, now = new Date(), offset = 0 } = {}) {
  const day = Math.floor(now.getTime() / 86400000) + offset;
  const pinned = (env.EDGE_TTS_VOICE || '').trim();
  const voices = parseVoiceList(env);
  const voice = pinned || voices[day % voices.length];
  return {
    voice,
    rate: (env.EDGE_TTS_RATE || '').trim() || RATES[day % RATES.length],
    pitch:
      (env.EDGE_TTS_PITCH || '').trim() ||
      PITCHES[Math.floor(day / 3) % PITCHES.length],
    pinned: !!pinned,
  };
}

/** `=` form is required because rate/pitch values start with + or -. */
function buildEdgeTtsArgs({ voice, rate, pitch }, text, outPath) {
  return [
    '--voice',
    voice,
    `--rate=${rate}`,
    `--pitch=${pitch}`,
    '--text',
    text,
    '--write-media',
    outPath,
  ];
}

/** Estimate line durations (sec) when no voice audio exists (captions only). */
function estimateLineDurations(lines, wordsPerSec = 2.9) {
  return lines.map((l) =>
    Math.max(0.6, l.split(/\s+/).filter(Boolean).length / wordsPerSec),
  );
}

module.exports = {
  DEFAULT_VOICES,
  pickVoice,
  buildEdgeTtsArgs,
  estimateLineDurations,
  parseVoiceList,
};
