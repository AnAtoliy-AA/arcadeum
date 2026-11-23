'use strict';

const { ingestManifest } = require('./manifest');
const { recordPost } = require('./store');
const { refreshStats } = require('./refresh');
const { getConfig } = require('./config');

/**
 * Called by daily-runner.js after the pipelines finish.
 * 1. Ingest manifest lines written by posters (with Postiz post ids).
 * 2. For each successful pipeline that wrote none, record a metadata-only
 *    fallback (no post ids, so it is never fetched) so the post is not lost.
 * 3. Refresh stats of posts >= minAgeHours old (only when POSTIZ_API_KEY set).
 * All errors are swallowed and logged. Preview mode does nothing.
 */
async function runAnalyticsHook({
  isPreview,
  targetGame,
  results,
  log,
  deps = {},
}) {
  if (isPreview) return { skipped: 'preview' };
  const out = { recorded: 0, refresh: null };
  try {
    const ingest = deps.ingestManifest || ingestManifest;
    const record = deps.recordPost || recordPost;
    const ingested = ingest();
    out.recorded = ingested.length;
    if (!ingested.length) {
      for (const r of results.filter((x) => x.success)) {
        record({
          game: targetGame || 'unknown',
          format: r.name,
          scenario: null,
          platforms: [],
          posts: [],
        });
        out.recorded += 1;
      }
    }
    log(`Analytics: recorded ${out.recorded} post(s)`);
  } catch (err) {
    log(`Analytics record failed: ${err.message}`);
  }
  try {
    const cfg = getConfig();
    if (!cfg.postizApiKey && !deps.refreshStats) {
      log('Analytics: POSTIZ_API_KEY not set, skipping stats refresh');
    } else {
      out.refresh = await (deps.refreshStats || refreshStats)();
      log(
        `Analytics: refreshed ${out.refresh.refreshed} post(s), ${out.refresh.errors.length} error(s)`,
      );
    }
  } catch (err) {
    log(`Analytics refresh failed: ${err.message}`);
  }
  return out;
}

module.exports = { runAnalyticsHook };
