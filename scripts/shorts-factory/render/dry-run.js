#!/usr/bin/env node
'use strict';

/**
 * Dry-run: render a sample short locally from an existing recording.
 * Never posts, never contacts Postiz / Telegram / platform APIs.
 *
 *   node scripts/shorts-factory/render/dry-run.js \
 *     [--input recording.webm]   (default: generated test pattern)
 *     [--scenario chess_demo] [--caption "text"] [--out ./output]
 *     [--music file-or-url] [--voice-file voice.mp3] [--no-voice]
 *     [--cta A|B] [--dramatic-ms 4000] [--sidecar x.scenario.json]
 *
 * Voice uses edge-tts when installed (network call to Microsoft TTS),
 * otherwise renders without voice and the QA gate reports it.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { renderShort } = require('./pipeline');
const { formatQaReport } = require('./qa');

function parseArgs(argv) {
  const out = { flags: new Set() };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out.flags.add(key);
    else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function makeSampleRecording(file) {
  const r = spawnSync('ffmpeg', [
    '-f',
    'lavfi',
    '-i',
    'testsrc2=size=1080x1920:rate=30:duration=20',
    '-pix_fmt',
    'yuv420p',
    '-y',
    file,
  ]);
  if (r.status !== 0) throw new Error('Could not generate sample recording');
}

function makeSampleMusic(file) {
  const r = spawnSync('ffmpeg', [
    '-f',
    'lavfi',
    '-i',
    'sine=frequency=220:duration=40',
    '-f',
    'lavfi',
    '-i',
    'sine=frequency=330:duration=40',
    '-filter_complex',
    'amix=inputs=2',
    '-y',
    file,
  ]);
  if (r.status !== 0) throw new Error('Could not generate sample music');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outputDir = path.resolve(
    args.out || path.join(process.cwd(), 'output', 'dry-run'),
  );
  fs.mkdirSync(outputDir, { recursive: true });
  if (args.cta) process.env.SHORTS_CTA_VARIANT = args.cta;

  let input = args.input ? path.resolve(args.input) : null;
  if (!input) {
    input = path.join(outputDir, 'sample-recording.mp4');
    makeSampleRecording(input);
    console.log(`No --input given, using generated test pattern: ${input}`);
  }
  let music = args.music || null;
  if (!music && !process.env.SHORTS_MUSIC_DIR) {
    music = path.join(outputDir, 'sample-music.mp3');
    makeSampleMusic(music);
  }

  const result = await renderShort({
    rawVideoPath: input,
    recordedDurationMs: 20000,
    startOffsetMs: 0,
    dramaticMomentMs: args['dramatic-ms']
      ? Number(args['dramatic-ms'])
      : undefined,
    sidecarPath: args.sidecar ? path.resolve(args.sidecar) : undefined,
    scenario: args.scenario || 'chess_demo',
    caption:
      args.caption ||
      (args.sidecar
        ? undefined
        : 'Chess against Stockfish in your browser. Forty AI bots, ranked seasons, and daily puzzles. Play free, no download.'),
    tags: '#arcadeumgames #gaming #chess #gamers #onlinegaming',
    outputDir,
    tracks: music ? [music] : [],
    voiceFile: args['voice-file']
      ? path.resolve(args['voice-file'])
      : undefined,
    noVoice: args.flags.has('no-voice'),
  });

  console.log(`\nOutput:   ${result.outputPath}`);
  console.log(`Metadata: ${result.outputPath}.meta.json`);
  console.log(
    `CTA variant: ${result.metadata.ctaVariant.id} ("${result.metadata.ctaVariant.text}")`,
  );
  console.log(formatQaReport(result.qa));
  process.exit(result.qa.passed ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
