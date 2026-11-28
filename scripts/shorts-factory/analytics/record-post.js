'use strict';

/**
 * Called by factory.js and gameplay.js right after a video is posted or
 * scheduled. Turns the Postiz create-post responses into one manifest line so
 * the post ids (and the experiment dimensions: format, hook, voice, CTA,
 * length class) reach the analytics history via daily-runner's ingest step.
 *
 * Never throws and never talks to the network: it only appends one NDJSON
 * line. Tests pass mock responses; nothing here posts anything.
 */

const { appendManifest, postsFromPostizResponse } = require('./manifest');
const { classifyDuration } = require('../length/classes');

const PLATFORM_KEYS = [
  [/youtube/i, 'youtube'],
  [/instagram/i, 'instagram'],
  [/tiktok/i, 'tiktok'],
  [/^x\b|twitter/i, 'x'],
];

function platformKey(name) {
  const hit = PLATFORM_KEYS.find(([re]) => re.test(String(name)));
  return hit ? hit[1] : String(name).toLowerCase();
}

/**
 * opts: { game, scenario (id), format, hook, voice, cta, lengthClass,
 *   durationSec (measured), results: [{ platform, data }] }
 * `voice` and `cta` may be strings or { voice } / { id } objects.
 * Returns the manifest entry, or null when there are no post ids to record.
 */
function buildManifestEntry(opts) {
  const posts = [];
  for (const r of opts.results || []) {
    if (r && r.success === false) continue;
    posts.push(...postsFromPostizResponse(platformKey(r.platform), r.data));
  }
  if (!posts.length) return null;
  const voice =
    opts.voice && typeof opts.voice === 'object'
      ? opts.voice.voice
      : opts.voice;
  const cta = opts.cta && typeof opts.cta === 'object' ? opts.cta.id : opts.cta;
  const durationSec =
    typeof opts.durationSec === 'number' && Number.isFinite(opts.durationSec)
      ? Number(opts.durationSec.toFixed(2))
      : null;
  return {
    date: opts.date || new Date().toISOString(),
    game: opts.game || 'unknown',
    scenario: opts.scenario || null,
    format: opts.format || null,
    hook: opts.hook || null,
    voice: voice || null,
    cta: cta || null,
    lengthClass: opts.lengthClass || classifyDuration(durationSec),
    durationSec,
    platforms: [...new Set(posts.map((p) => p.platform))],
    posts,
  };
}

function recordPosted(opts, { append = appendManifest, log = () => {} } = {}) {
  try {
    const entry = buildManifestEntry(opts);
    if (!entry) {
      log('Analytics: no post ids to record');
      return null;
    }
    append(entry);
    log(`Analytics: queued ${entry.posts.length} post id(s) for stats`);
    return entry;
  } catch (err) {
    log(`Analytics: manifest write failed: ${err.message}`);
    return null;
  }
}

module.exports = { buildManifestEntry, recordPosted, platformKey };
