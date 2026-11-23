'use strict';

/**
 * Hand-off between the posting scripts (gameplay.js / factory.js, which run as
 * child processes of daily-runner.js) and the runner. A poster appends one
 * NDJSON line per posted video; the runner ingests them into the history.
 *
 *   const { appendManifest } = require('./analytics/manifest');
 *   appendManifest({ game, scenario, format, hook, voice, cta,
 *     platforms: ['TikTok'], posts: [{ platform: 'tiktok', postId: 'abc' }] });
 */

const fs = require('fs');
const path = require('path');
const { getConfig } = require('./config');
const { recordPost } = require('./store');

function appendManifest(entry, manifestPath = getConfig().manifestPath) {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.appendFileSync(manifestPath, `${JSON.stringify(entry)}\n`);
}

/** Extract post ids from a Postiz create-post response ([{postId, integration}]). */
function postsFromPostizResponse(platform, data) {
  const list = Array.isArray(data) ? data : data ? [data] : [];
  return list
    .map((p) => ({ platform, postId: p && (p.postId || p.id) }))
    .filter((p) => p.postId);
}

/** Move manifest lines into history and truncate the manifest. */
function ingestManifest(opts = {}) {
  const cfg = getConfig();
  const manifestPath = opts.manifestPath || cfg.manifestPath;
  const historyPath = opts.historyPath || cfg.historyPath;
  let raw = '';
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch {
    return [];
  }
  const recorded = [];
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    try {
      recorded.push(recordPost(JSON.parse(line), historyPath));
    } catch {
      // skip malformed line
    }
  }
  fs.unlinkSync(manifestPath);
  return recorded;
}

module.exports = { appendManifest, ingestManifest, postsFromPostizResponse };
