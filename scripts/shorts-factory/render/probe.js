'use strict';

const { spawn } = require('child_process');

function run(bin, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args);
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('error', reject);
    p.on('close', (code) => resolve({ code, out, err }));
  });
}

async function probeInfo(file) {
  const { code, out, err } = await run('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'stream=codec_type,width,height:format=duration',
    '-of',
    'json',
    file,
  ]);
  if (code !== 0) throw new Error(`ffprobe failed: ${err.slice(-200)}`);
  const j = JSON.parse(out);
  const v = (j.streams || []).find((s) => s.codec_type === 'video');
  return {
    durationSec: parseFloat(j.format && j.format.duration),
    width: v ? v.width : undefined,
    height: v ? v.height : undefined,
    hasAudio: (j.streams || []).some((s) => s.codec_type === 'audio'),
    hasVideo: !!v,
  };
}

/** Integrated loudness (LUFS) via ebur128, parsed from the final summary. */
function parseLufs(stderr) {
  const idx = stderr.lastIndexOf('Integrated loudness:');
  const m = (idx >= 0 ? stderr.slice(idx) : stderr).match(
    /I:\s+(-?\d+(?:\.\d+)?)\s+LUFS/,
  );
  return m ? parseFloat(m[1]) : null;
}

async function measureLufs(file) {
  const { err } = await run('ffmpeg', [
    '-nostats',
    '-i',
    file,
    '-vn',
    '-af',
    'ebur128=peak=true',
    '-f',
    'null',
    '-',
  ]);
  return parseLufs(err);
}

function parseMeanVolume(stderr) {
  const m = stderr.match(/mean_volume:\s+(-?\d+(?:\.\d+)?)\s+dB/);
  return m ? parseFloat(m[1]) : null;
}

async function measureMeanVolume(file) {
  const { err } = await run('ffmpeg', [
    '-nostats',
    '-i',
    file,
    '-vn',
    '-af',
    'volumedetect',
    '-f',
    'null',
    '-',
  ]);
  return parseMeanVolume(err);
}

function parseLuma(stdout) {
  const m = stdout.match(/lavfi\.signalstats\.YAVG=(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

async function measureFirstFrameLuma(file) {
  const { out } = await run('ffmpeg', [
    '-v',
    'error',
    '-i',
    file,
    '-frames:v',
    '1',
    '-vf',
    'signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-',
    '-f',
    'null',
    '-',
  ]);
  return parseLuma(out);
}

module.exports = {
  probeInfo,
  measureLufs,
  measureMeanVolume,
  measureFirstFrameLuma,
  parseLufs,
  parseMeanVolume,
  parseLuma,
};
