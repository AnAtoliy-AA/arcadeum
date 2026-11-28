'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const {
  DURATION,
  durationBounds,
  HOOK_WINDOW_SEC,
  MUSIC,
  SITE,
  envFlag,
} = require('./config');
const { deriveHook, pickStartOffsetSec } = require('./hook');
const { placeLines, wordWeight, round3 } = require('./captions');
const { estimateLineDurations } = require('./voice-plan');
const { buildVoiceScript, synthesizeScript } = require('./voice');
const { listLocalTracks, pickTrack } = require('./audio');
const { pickCtaVariant } = require('./cta');
const { renderOverlays } = require('./overlays');
const { buildRenderArgs } = require('./ffmpeg-graph');
const { buildPlatformMetadata } = require('./metadata');
const { evaluateQuality, formatQaReport } = require('./qa');
const probe = require('./probe');
const { loadSidecar, applySidecar } = require('./sidecar');

const DEFAULT_LOGO = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'apps',
  'web',
  'public',
  'logo.png',
);

const defaultLog = (level, msg, data) =>
  console.log(`[render:${level}] ${msg}`, data ? JSON.stringify(data) : '');

/** Spoken line budget per length class (short keeps the original 9). */
const MAX_VOICE_LINES = { short: 9, medium: 16, long: 26, feature: 48 };

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

/** Scale estimated per-line durations so they add up to a known audio length. */
function fitDurationsToTotal(lines, totalSec, gapSec = 0.18) {
  const weights = lines.map((l) =>
    l
      .split(/\s+/)
      .filter(Boolean)
      .reduce((s, w) => s + wordWeight(w), 0),
  );
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const usable = Math.max(0.5, totalSec - gapSec * (lines.length - 1));
  return weights.map((w) => (w / sum) * usable);
}

function runFfmpeg(args, log) {
  return new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', args);
    let err = '';
    p.stderr.on('data', (d) => (err += d));
    p.on('error', reject);
    p.on('close', (code) => {
      if (code === 0) return resolve();
      log('error', 'ffmpeg failed', { code, stderr: err.slice(-1500) });
      reject(new Error(`ffmpeg exited ${code}: ${err.slice(-300)}`));
    });
  });
}

function chooseMusic({
  tracks,
  outputDir,
  env = process.env,
  now = new Date(),
}) {
  const localDir = env.SHORTS_MUSIC_DIR || '';
  const local = listLocalTracks(localDir);
  const pool = local.length ? local : tracks || [];
  const stateFile = path.join(outputDir, '.last-track');
  let last = null;
  try {
    last = fs.readFileSync(stateFile, 'utf8').trim();
  } catch {}
  const track = pickTrack(pool, { now, lastTrack: last });
  if (track) {
    try {
      fs.writeFileSync(stateFile, track);
    } catch {}
  }
  return { track, source: local.length ? 'local' : 'remote' };
}

/**
 * Render a finished short.
 *
 * opts: rawVideoPath, recordedDurationMs, startOffsetMs, dramaticMomentMs,
 *   scenario (name string or object with optional .hook), caption (voice/body
 *   text), tags (hashtag string), outputDir, tracks (fallback list/URLs),
 *   musicVolume, voiceFile (optional pre-made voice, dry-run), noVoice,
 *   log, logoPath, lengthClass ('short' | 'medium' | 'long' | 'feature': sets
 *   the allowed duration, QA range and script line budget), voiceScript
 *   (structured script from the scenario; replaces the caption body).
 */
async function renderShort(inputOpts) {
  const opts = applySidecar(
    inputOpts,
    inputOpts.sidecarPath
      ? loadSidecar(inputOpts.sidecarPath)
      : loadSidecar(inputOpts.rawVideoPath),
  );
  const log = opts.log || defaultLog;
  const env = opts.env || process.env;
  const outputDir = opts.outputDir;
  fs.mkdirSync(outputDir, { recursive: true });
  const stamp = Date.now();
  const workDir = path.join(outputDir, `work-${stamp}`);
  fs.mkdirSync(workDir, { recursive: true });

  const hook = deriveHook({ scenario: opts.scenario, caption: opts.caption });
  const bounds = durationBounds(opts.lengthClass);
  const script = buildVoiceScript({
    hook,
    caption: opts.voiceScript || opts.caption,
    maxLines: MAX_VOICE_LINES[opts.lengthClass] || 9,
  });

  // Voice: synthesize (rotating voices), use a supplied file, or none.
  let voice = null;
  if (!opts.noVoice) {
    if (opts.voiceFile) {
      const info = await probe.probeInfo(opts.voiceFile);
      const durs = fitDurationsToTotal(script, info.durationSec);
      voice = {
        path: opts.voiceFile,
        voice: 'supplied-file',
        rate: null,
        pitch: null,
        lines: placeLines(durs, script),
        durationSec: info.durationSec,
      };
    } else {
      voice = await synthesizeScript(script, { outDir: workDir, env, log });
    }
  }

  const lead = DURATION.voiceLeadInSec;
  const lineTimes = voice
    ? voice.lines.map((l) => ({
        ...l,
        start: round3(l.start + lead),
        end: round3(l.end + lead),
      }))
    : placeLines(estimateLineDurations(script), script, { startSec: lead });
  const lastEnd = lineTimes[lineTimes.length - 1].end;
  const mainSec = clamp(
    lastEnd + DURATION.voiceTailSec,
    bounds.minMainSec,
    bounds.maxMainSec,
  );

  const { startSec, usedDramatic } = pickStartOffsetSec({
    startOffsetMs: opts.startOffsetMs,
    recordedDurationMs: opts.recordedDurationMs,
    dramaticMomentMs: opts.dramaticMomentMs,
  });

  const hookEnd = Math.min(
    mainSec,
    Math.max(HOOK_WINDOW_SEC, lineTimes[0].end + 0.3),
  );
  const music = chooseMusic({ tracks: opts.tracks, outputDir, env });
  if (!music.track) throw new Error('No music track available');
  const cta = pickCtaVariant({ env });

  log('info', 'Rendering overlays (Chromium)');
  const overlays = await renderOverlays({
    outDir: path.join(workDir, 'overlays'),
    hookText: hook,
    hookEndSec: hookEnd,
    captionLines: lineTimes.slice(1),
    cta,
    siteName: SITE.name,
    logoPath: opts.logoPath || DEFAULT_LOGO,
  });

  const outPath = path.join(outputDir, `arcadeum-${stamp}.mp4`);
  const args = buildRenderArgs({
    rawPath: opts.rawVideoPath,
    startSec: startSec,
    mainSec,
    endCardSec: DURATION.endCardSec,
    musicPath: music.track,
    musicVolume: opts.musicVolumeFor
      ? opts.musicVolumeFor(music.track)
      : (opts.musicVolume ?? MUSIC.baseVolume),
    voicePath: voice ? voice.path : null,
    voiceLeadSec: lead,
    overlays,
    outPath,
  });
  log('info', 'Running ffmpeg render', { mainSec, startSec, cta: cta.id });
  await runFfmpeg(args, log);

  // Quality gate.
  const info = await probe.probeInfo(outPath);
  const qaInput = {
    durationSec: info.durationSec,
    width: info.width,
    height: info.height,
    hasAudio: info.hasAudio,
    loudnessLufs: await probe.measureLufs(outPath),
    firstFrameLuma: await probe.measureFirstFrameLuma(outPath),
    captionRects: overlays.rects,
    voiceExpected: !opts.noVoice,
    voiceMeanDb: voice ? await probe.measureMeanVolume(voice.path) : null,
  };
  const qa = evaluateQuality(qaInput, { lengthClass: opts.lengthClass });
  log(qa.passed ? 'info' : 'warn', formatQaReport(qa));

  const metadata = {
    outputPath: outPath,
    scenario:
      typeof opts.scenario === 'object' ? opts.scenario.name : opts.scenario,
    hook,
    ctaVariant: cta,
    voice: voice
      ? { voice: voice.voice, rate: voice.rate, pitch: voice.pitch }
      : null,
    music: { track: path.basename(music.track), source: music.source },
    startSec: round3(startSec),
    startedOnDramaticMoment: usedDramatic,
    durationSec: info.durationSec,
    lengthClass: opts.lengthClass || null,
    platforms: buildPlatformMetadata({
      caption: opts.caption,
      hook,
      tags: opts.tags,
      ctaVariant: cta,
    }),
    qa,
    createdAt: new Date().toISOString(),
  };
  fs.writeFileSync(`${outPath}.meta.json`, JSON.stringify(metadata, null, 2));
  if (envFlag('SHORTS_KEEP_RENDER_WORK', false, env) === false) {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
  return { outputPath: outPath, metadata, qa, voiceAvailable: !!voice };
}

module.exports = { renderShort, fitDurationsToTotal, chooseMusic };
