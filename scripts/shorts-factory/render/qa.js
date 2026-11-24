'use strict';

const { DURATION, LOUDNESS, VIDEO } = require('./config');
const { rectWithinZone, getSafeZone } = require('./safezone');

/**
 * Pure quality gate. `m` holds measurements (see probe.js):
 *   durationSec, width, height, loudnessLufs, hasAudio, firstFrameLuma (0-255),
 *   voiceExpected, voiceMeanDb, captionRects [{x,y,width,height}]
 * Returns { passed, checks, failures } where each check is
 * { id, ok, value, expected, detail }.
 */
function evaluateQuality(m, opts = {}) {
  const zone = opts.zone || getSafeZone();
  const checks = [];
  const add = (id, ok, value, expected, detail) =>
    checks.push({ id, ok: !!ok, value, expected, detail });

  const dur = m.durationSec;
  add(
    'duration',
    typeof dur === 'number' &&
      dur >= DURATION.minTotalSec &&
      dur <= DURATION.maxTotalSec,
    dur,
    `${DURATION.minTotalSec}-${DURATION.maxTotalSec}s`,
    `duration ${fmt(dur)}s`,
  );

  add(
    'resolution',
    m.width === VIDEO.width && m.height === VIDEO.height,
    `${m.width}x${m.height}`,
    `${VIDEO.width}x${VIDEO.height}`,
    `resolution ${m.width}x${m.height}`,
  );

  const lufs = m.loudnessLufs;
  add(
    'loudness',
    m.hasAudio !== false &&
      typeof lufs === 'number' &&
      lufs >= LOUDNESS.minLufs &&
      lufs <= LOUDNESS.maxLufs,
    lufs,
    `${LOUDNESS.minLufs}..${LOUDNESS.maxLufs} LUFS`,
    m.hasAudio === false ? 'no audio stream' : `loudness ${fmt(lufs)} LUFS`,
  );

  add(
    'first_frame',
    typeof m.firstFrameLuma === 'number' && m.firstFrameLuma >= 16,
    m.firstFrameLuma,
    'avg luma >= 16 (not black)',
    `first frame luma ${fmt(m.firstFrameLuma)}`,
  );

  const rects = m.captionRects || [];
  const outside = rects.filter((r) => !rectWithinZone(r, zone));
  add(
    'captions_safe_zone',
    rects.length > 0 && outside.length === 0,
    outside.length,
    `all ${rects.length || 'some'} caption boxes inside safe zone`,
    rects.length === 0
      ? 'no captions rendered'
      : `${outside.length} of ${rects.length} caption boxes outside safe zone`,
  );

  if (m.voiceExpected !== false) {
    const present =
      typeof m.voiceMeanDb === 'number' &&
      m.voiceMeanDb > (opts.minVoiceDb ?? -45);
    add(
      'voice_present',
      present,
      m.voiceMeanDb,
      'voice mean volume > -45 dB',
      present ? `voice ${fmt(m.voiceMeanDb)} dB` : 'voice missing or silent',
    );
  }

  const failures = checks.filter((c) => !c.ok);
  return { passed: failures.length === 0, checks, failures };
}

function fmt(n) {
  return typeof n === 'number' && Number.isFinite(n) ? n.toFixed(1) : 'n/a';
}

/** Human readable multi-line summary for the approval request. */
function formatQaReport(qa) {
  if (qa.passed) return 'QA: all checks passed';
  return [
    `QA FAILED (${qa.failures.length}/${qa.checks.length} checks):`,
    ...qa.failures.map((f) => `- ${f.id}: ${f.detail} (want ${f.expected})`),
  ].join('\n');
}

module.exports = { evaluateQuality, formatQaReport };
