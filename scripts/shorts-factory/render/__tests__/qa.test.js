'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateQuality, formatQaReport } = require('../qa');
const { parseLufs, parseMeanVolume, parseLuma } = require('../probe');

const good = () => ({
  durationSec: 20,
  width: 1080,
  height: 1920,
  hasAudio: true,
  loudnessLufs: -14.2,
  firstFrameLuma: 90,
  captionRects: [{ x: 100, y: 400, width: 800, height: 200 }],
  voiceExpected: true,
  voiceMeanDb: -24,
});

test('good render passes', () => {
  const qa = evaluateQuality(good());
  assert.equal(qa.passed, true);
  assert.equal(qa.failures.length, 0);
});

test('duration out of range fails', () => {
  assert.equal(
    evaluateQuality({ ...good(), durationSec: 12 }).failures[0].id,
    'duration',
  );
  assert.equal(evaluateQuality({ ...good(), durationSec: 31 }).passed, false);
});

test('loudness too quiet or missing audio fails', () => {
  assert.equal(evaluateQuality({ ...good(), loudnessLufs: -30 }).passed, false);
  assert.equal(evaluateQuality({ ...good(), hasAudio: false }).passed, false);
});

test('black first frame fails', () => {
  const qa = evaluateQuality({ ...good(), firstFrameLuma: 2 });
  assert.deepEqual(
    qa.failures.map((f) => f.id),
    ['first_frame'],
  );
});

test('caption outside safe zone or none fails', () => {
  const low = { x: 100, y: 1600, width: 800, height: 100 };
  assert.deepEqual(
    evaluateQuality({ ...good(), captionRects: [low] }).failures.map(
      (f) => f.id,
    ),
    ['captions_safe_zone'],
  );
  assert.equal(evaluateQuality({ ...good(), captionRects: [] }).passed, false);
});

test('missing voice fails only when voice expected', () => {
  assert.deepEqual(
    evaluateQuality({ ...good(), voiceMeanDb: null }).failures.map((f) => f.id),
    ['voice_present'],
  );
  assert.equal(
    evaluateQuality({ ...good(), voiceMeanDb: null, voiceExpected: false })
      .passed,
    true,
  );
});

test('wrong resolution fails', () => {
  assert.equal(
    evaluateQuality({ ...good(), width: 720, height: 1280 }).passed,
    false,
  );
});

test('formatQaReport lists failures', () => {
  const qa = evaluateQuality({ ...good(), durationSec: 5, firstFrameLuma: 0 });
  const text = formatQaReport(qa);
  assert.match(text, /QA FAILED \(2\/6/);
  assert.match(text, /- duration:/);
  assert.equal(
    formatQaReport(evaluateQuality(good())),
    'QA: all checks passed',
  );
});

test('ffmpeg output parsers', () => {
  assert.equal(
    parseLufs('Integrated loudness:\n    I:         -14.3 LUFS\n'),
    -14.3,
  );
  assert.equal(parseMeanVolume('[Parsed] mean_volume: -21.7 dB'), -21.7);
  assert.equal(parseLuma('lavfi.signalstats.YAVG=104.2'), 104.2);
  assert.equal(parseLufs('nothing'), null);
});
