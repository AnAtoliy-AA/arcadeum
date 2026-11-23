'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { pickTrack, buildAudioGraph } = require('../audio');
const {
  pickVoice,
  buildEdgeTtsArgs,
  DEFAULT_VOICES,
} = require('../voice-plan');
const { buildVoiceScript } = require('../voice');
const { buildRenderArgs } = require('../ffmpeg-graph');
const { fitDurationsToTotal } = require('../pipeline');

test('voice rotates across days and honours pins and lists', () => {
  const seen = new Set();
  for (let d = 0; d < DEFAULT_VOICES.length; d++) {
    seen.add(
      pickVoice({ env: {}, now: new Date(Date.UTC(2026, 0, 1 + d)) }).voice,
    );
  }
  assert.equal(seen.size, DEFAULT_VOICES.length);
  assert.equal(
    pickVoice({ env: { EDGE_TTS_VOICE: 'en-GB-RyanNeural' } }).voice,
    'en-GB-RyanNeural',
  );
  assert.equal(
    pickVoice({ env: { EDGE_TTS_VOICES: 'a,b' }, now: new Date(0) }).voice,
    'a',
  );
  assert.equal(pickVoice({ env: { EDGE_TTS_RATE: '+20%' } }).rate, '+20%');
});

test('edge-tts args use = form for rate and pitch', () => {
  const args = buildEdgeTtsArgs(
    { voice: 'v', rate: '+8%', pitch: '+2Hz' },
    'hi',
    'o.mp3',
  );
  assert.ok(args.includes('--rate=+8%'));
  assert.ok(args.includes('--pitch=+2Hz'));
  assert.deepEqual(args.slice(-2), ['--write-media', 'o.mp3'].slice(0, 2));
});

test('voice script starts with the hook and is split short', () => {
  const s = buildVoiceScript({
    hook: 'Can you beat Stockfish?',
    caption: 'Play chess free. Play chess free. Forty bots await you today!',
  });
  assert.equal(s[0], 'Can you beat Stockfish?');
  assert.equal(s.filter((l) => l === 'Play chess free.').length, 1);
});

test('track rotation avoids repeating the last track', () => {
  const tracks = ['a', 'b', 'c'];
  const now = new Date(Date.UTC(2026, 0, 1));
  const first = pickTrack(tracks, { now });
  assert.notEqual(pickTrack(tracks, { now, lastTrack: first }), first);
  assert.equal(pickTrack([], { now }), null);
});

test('audio graph: ducking + loudnorm to -14 LUFS with voice', () => {
  const g = buildAudioGraph({ musicIdx: 1, voiceIdx: 2, totalSec: 20 });
  assert.match(g, /sidechaincompress/);
  assert.match(g, /loudnorm=I=-14/);
  assert.match(g, /\[a\]$/);
  const solo = buildAudioGraph({ musicIdx: 1, totalSec: 20 });
  assert.ok(!/sidechaincompress/.test(solo));
  assert.match(solo, /loudnorm=I=-14/);
});

test('render args: 1080x1920, no metadata, overlays enabled by time', () => {
  const ov = {
    hook: { file: 'h.png', x: 1, y: 2, start: 0, end: 2.6 },
    watermark: { file: 'w.png', x: 3, y: 4 },
    captions: [{ file: 'c.png', x: 5, y: 6, start: 1, end: 2 }],
    endCard: { file: 'e.png' },
  };
  const args = buildRenderArgs({
    rawPath: 'r.webm',
    startSec: 1,
    mainSec: 15,
    endCardSec: 3,
    musicPath: 'm.mp3',
    voicePath: 'v.mp3',
    voiceLeadSec: 0.25,
    overlays: ov,
    outPath: 'o.mp4',
  });
  const fc = args[args.indexOf('-filter_complex') + 1];
  assert.match(fc, /scale=1080:1920/);
  assert.match(fc, /enable='between\(t,0\.000,2\.600\)'/);
  assert.match(fc, /concat=n=2:v=1:a=0/);
  assert.ok(args.includes('-map_metadata'));
  assert.equal(args[args.indexOf('-t', args.indexOf('-map')) + 1], '18.000');
});

test('fitDurationsToTotal sums to total minus gaps', () => {
  const d = fitDurationsToTotal(['a b c', 'd e'], 5, 0.2);
  assert.ok(Math.abs(d[0] + d[1] - 4.8) < 1e-9);
});
