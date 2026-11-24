'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildFfmpegArgs,
  redactArgs,
  withNice,
  parseProgressLine,
} = require('../ffmpeg');
const { loadConfig, buildRtmpTarget, PROFILES } = require('../config');
const { buildConcatList } = require('../music');
const { nextBackoff } = require('../backoff');

const rtmp = { kind: 'rtmp', target: 'rtmp://live.example/app/SECRETKEY' };
const x11 = { mode: 'x11grab', display: ':99' };
const get = (a, flag) => a[a.indexOf(flag) + 1];

test('720p30 live command: x264, 2s keyframes, bitrate, flv', () => {
  const a = buildFfmpegArgs({
    profile: PROFILES.standard,
    capture: x11,
    audio: {
      pulseSource: 'arcadeum_live.monitor',
      musicList: '/tmp/m.ffconcat',
    },
    output: rtmp,
  });
  assert.equal(get(a, '-video_size'), '1280x720');
  assert.equal(get(a, '-framerate'), '30');
  assert.equal(get(a, '-c:v'), 'libx264');
  assert.equal(get(a, '-preset'), 'veryfast');
  assert.equal(get(a, '-g'), '60');
  assert.equal(get(a, '-keyint_min'), '60');
  assert.equal(get(a, '-b:v'), '3500k');
  assert.equal(get(a, '-maxrate'), '3500k');
  assert.equal(get(a, '-bufsize'), '7000k');
  assert.ok(a.includes('pulse') && a.includes('-stream_loop'));
  assert.match(get(a, '-filter_complex'), /amix=inputs=2/);
  assert.deepEqual(a.slice(-3), ['-f', 'flv', rtmp.target]);
});

test('lite profile is 720p25 ultrafast with 50-frame GOP', () => {
  const a = buildFfmpegArgs({
    profile: PROFILES.lite,
    capture: x11,
    output: rtmp,
  });
  assert.equal(get(a, '-framerate'), '25');
  assert.equal(get(a, '-preset'), 'ultrafast');
  assert.equal(get(a, '-g'), '50');
});

test('1080p via STREAM_RESOLUTION', () => {
  const c = loadConfig(
    { STREAM_RESOLUTION: '1920x1080', STREAM_VIDEO_KBPS: '4500' },
    [],
  );
  const a = buildFfmpegArgs({ profile: c.profile, capture: x11, output: rtmp });
  assert.equal(get(a, '-video_size'), '1920x1080');
  assert.equal(get(a, '-b:v'), '4500k');
});

test('silent track when no audio inputs', () => {
  const a = buildFfmpegArgs({
    profile: PROFILES.standard,
    capture: x11,
    output: rtmp,
  });
  assert.ok(a.join(' ').includes('anullsrc'));
});

test('dry run outputs: file with -t, and null muxer', () => {
  const f = buildFfmpegArgs({
    profile: PROFILES.standard,
    capture: { mode: 'testsrc' },
    output: { kind: 'file', path: '/x/o.mp4', durationSec: 180 },
  });
  assert.equal(get(f, '-t'), '180');
  assert.equal(f[f.length - 1], '/x/o.mp4');
  assert.ok(f.join(' ').includes('testsrc2'));
  const n = buildFfmpegArgs({
    profile: PROFILES.standard,
    capture: x11,
    output: { kind: 'null', durationSec: 60 },
  });
  assert.deepEqual(n.slice(-3), ['-f', 'null', '-']);
});

test('the stream key never appears in redacted args', () => {
  const a = buildFfmpegArgs({
    profile: PROFILES.standard,
    capture: x11,
    output: rtmp,
  });
  assert.ok(!JSON.stringify(redactArgs(a)).includes('SECRETKEY'));
});

test('nice wrapper and progress parsing', () => {
  assert.deepEqual(withNice('ffmpeg', ['-i'], 10), {
    cmd: 'nice',
    args: ['-n', '10', 'ffmpeg', '-i'],
  });
  assert.deepEqual(withNice('ffmpeg', ['-i'], 0), {
    cmd: 'ffmpeg',
    args: ['-i'],
  });
  assert.deepEqual(parseProgressLine('frame=120'), {
    key: 'frame',
    value: 120,
  });
  assert.deepEqual(parseProgressLine('fps=29.97'), {
    key: 'fps',
    value: 29.97,
  });
  assert.equal(parseProgressLine('bitrate=1k'), null);
});

test('dry run is the default without STREAM_RTMP_URL; key from file or env', () => {
  assert.equal(loadConfig({}, []).dryRun, true);
  assert.equal(
    loadConfig({ STREAM_RTMP_URL: 'rtmp://h/app' }, ['--dry-run']).dryRun,
    true,
  );
  const c = loadConfig(
    { STREAM_RTMP_URL: 'rtmp://h/app/', STREAM_KEY: 'k1' },
    [],
  );
  assert.equal(c.dryRun, false);
  assert.equal(c.rtmpTarget, 'rtmp://h/app/k1');
  const f = loadConfig(
    { STREAM_RTMP_URL: 'rtmp://h/app', STREAM_KEY_FILE: '/k' },
    [],
    () => 'filekey\n',
  );
  assert.equal(f.rtmpTarget, 'rtmp://h/app/filekey');
  assert.equal(buildRtmpTarget('rtmp://h/a', ''), 'rtmp://h/a');
});

test('concat list escapes quotes; backoff doubles and caps', () => {
  assert.match(buildConcatList(["/m/it's.mp3"]), /file '\/m\/it'\\''s\.mp3'/);
  assert.deepEqual(
    [0, 1, 2, 3].map((n) => nextBackoff(n)),
    [1000, 2000, 4000, 8000],
  );
  assert.equal(nextBackoff(20), 60000);
});
