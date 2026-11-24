'use strict';

const { VIDEO, MUSIC } = require('./config');
const { buildAudioGraph } = require('./audio');

const t = (n) => Number(n).toFixed(3);

/**
 * Build the complete ffmpeg argument list (single pass: gameplay trim,
 * overlays, end card concat, ducked + loudnormed audio). Pure.
 *
 * plan: {
 *   rawPath, startSec, mainSec, endCardSec, musicPath, musicVolume,
 *   voicePath|null, voiceLeadSec, overlays:{hook,watermark,captions,endCard},
 *   outPath
 * }
 */
function buildRenderArgs(plan) {
  const { width: W, height: H, fps } = VIDEO;
  const total = plan.mainSec + plan.endCardSec;
  const inputs = [];
  let idx = 0;
  const add = (...a) => {
    inputs.push(...a);
    return idx++;
  };
  const rawIdx = add(
    '-ss',
    t(plan.startSec),
    '-t',
    t(plan.mainSec),
    '-i',
    plan.rawPath,
  );
  const musicIdx = add('-stream_loop', '-1', '-i', plan.musicPath);
  const voiceIdx = plan.voicePath ? add('-i', plan.voicePath) : null;
  const ecIdx = add(
    '-loop',
    '1',
    '-framerate',
    String(fps),
    '-t',
    t(plan.endCardSec),
    '-i',
    plan.overlays.endCard.file,
  );

  const filters = [
    `[${rawIdx}:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:black,` +
      `setsar=1,fps=${fps},eq=contrast=1.06:saturation=1.18,` +
      `tpad=stop_mode=clone:stop_duration=${t(plan.mainSec)},trim=duration=${t(plan.mainSec)},setpts=PTS-STARTPTS,format=yuv420p[b0]`,
  ];
  let cur = 'b0';
  let n = 0;
  const overlay = (file, x, y, start, end) => {
    const i = add('-i', file);
    const next = `b${++n}`;
    const en = end == null ? '' : `:enable='between(t,${t(start)},${t(end)})'`;
    filters.push(`[${cur}][${i}:v]overlay=${x}:${y}${en}[${next}]`);
    cur = next;
  };
  const { hook, watermark, captions } = plan.overlays;
  overlay(watermark.file, watermark.x, watermark.y, 0, null);
  overlay(hook.file, hook.x, hook.y, hook.start, hook.end);
  for (const c of captions) overlay(c.file, c.x, c.y, c.start, c.end);

  filters.push(
    `[${ecIdx}:v]scale=${W}:${H},setsar=1,fps=${fps},format=yuv420p,fade=t=in:st=0:d=0.35[ec]`,
    `[${cur}][ec]concat=n=2:v=1:a=0[v]`,
    buildAudioGraph({
      musicIdx,
      voiceIdx,
      musicVolume: plan.musicVolume ?? MUSIC.baseVolume,
      voiceLeadSec: plan.voiceLeadSec,
      totalSec: total,
    }),
  );

  return [
    ...inputs,
    '-filter_complex',
    filters.join(';'),
    '-map',
    '[v]',
    '-map',
    '[a]',
    '-t',
    t(total),
    '-c:v',
    'libx264',
    '-preset',
    'fast',
    '-crf',
    '21',
    '-pix_fmt',
    'yuv420p',
    '-r',
    String(fps),
    '-c:a',
    'aac',
    '-b:a',
    '160k',
    '-ar',
    '44100',
    '-movflags',
    '+faststart',
    '-map_metadata',
    '-1',
    '-y',
    plan.outPath,
  ];
}

module.exports = { buildRenderArgs };
