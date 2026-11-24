'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { envFlag } = require('./config');
const { splitIntoLines, placeLines, round3 } = require('./captions');
const { pickVoice, buildEdgeTtsArgs } = require('./voice-plan');
const { probeInfo } = require('./probe');

const LINE_GAP_SEC = 0.18;

function run(bin, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args);
    let err = '';
    p.stderr.on('data', (d) => (err += d));
    p.on('error', reject);
    p.on('close', (code) =>
      code === 0
        ? resolve()
        : reject(
            new Error(
              `${path.basename(bin)} exited ${code}: ${err.slice(-200)}`,
            ),
          ),
    );
  });
}

function resolveEdgeTtsBin(env = process.env) {
  const home = env.HOME || '/home/ubuntu';
  const candidates = [
    env.EDGE_TTS_BIN,
    path.join(home, 'tts-venv/bin/edge-tts'),
    '/usr/local/bin/edge-tts',
    '/usr/bin/edge-tts',
    '/home/ubuntu/tts-venv/bin/edge-tts',
  ].filter(Boolean);
  return candidates.find((b) => fs.existsSync(b)) || null;
}

/** Build the spoken script: hook first, then the caption body. */
function buildVoiceScript({ hook, caption, maxLines = 9 }) {
  const body = splitIntoLines(caption);
  const lines = [hook, ...body].filter(Boolean);
  const seen = new Set();
  return lines
    .filter((l) => {
      const k = l.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, maxLines);
}

/**
 * Synthesize one short mp3 per line, join them with small pauses.
 * Returns null on any failure (callers keep the existing "no voice" fallback).
 * Returns { path, voice, rate, pitch, lines:[{text,start,end}] } where start/end
 * are relative to the start of the voice file.
 */
async function synthesizeScript(
  lines,
  { outDir, env = process.env, log = () => {}, offset = 0 } = {},
) {
  if (!envFlag('EDGE_TTS_ENABLED', true, env)) return null;
  const bin = resolveEdgeTtsBin(env);
  if (!bin) {
    log('warn', 'edge-tts binary not found - skipping voice');
    return null;
  }
  const tuning = pickVoice({ env, offset });
  const parts = [];
  try {
    for (let i = 0; i < lines.length; i++) {
      const out = path.join(outDir, `voice-line-${Date.now()}-${i}.mp3`);
      await run(bin, buildEdgeTtsArgs(tuning, lines[i], out));
      const info = await probeInfo(out);
      parts.push({ file: out, durationSec: info.durationSec });
    }
    const joined = path.join(outDir, `voice-${Date.now()}.mp3`);
    const inputs = parts.flatMap((p) => ['-i', p.file]);
    const chain = parts
      .map(
        (_, i) =>
          `[${i}:a]aresample=44100,aformat=channel_layouts=mono,apad=pad_dur=${LINE_GAP_SEC}[a${i}]`,
      )
      .join(';');
    const labels = parts.map((_, i) => `[a${i}]`).join('');
    await run('ffmpeg', [
      ...inputs,
      '-filter_complex',
      `${chain};${labels}concat=n=${parts.length}:v=0:a=1[a]`,
      '-map',
      '[a]',
      '-c:a',
      'libmp3lame',
      '-b:a',
      '160k',
      '-y',
      joined,
    ]);
    const placed = placeLines(
      parts.map((p) => p.durationSec),
      lines,
      { gapSec: LINE_GAP_SEC },
    );
    parts.forEach((p) => fs.unlink(p.file, () => {}));
    log(
      'info',
      `Voiceover generated with ${tuning.voice} (${tuning.rate}, ${tuning.pitch})`,
    );
    return {
      path: joined,
      voice: tuning.voice,
      rate: tuning.rate,
      pitch: tuning.pitch,
      lines: placed,
      durationSec: round3(placed[placed.length - 1].end),
    };
  } catch (err) {
    log('warn', 'edge-tts failed - video will have no voice', {
      error: err.message,
    });
    parts.forEach((p) => fs.unlink(p.file, () => {}));
    return null;
  }
}

module.exports = {
  buildVoiceScript,
  synthesizeScript,
  resolveEdgeTtsBin,
  LINE_GAP_SEC,
};
