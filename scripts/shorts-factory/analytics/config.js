'use strict';

const os = require('os');
const path = require('path');

/**
 * Resolve analytics settings from env at call time (so tests can override).
 * Credentials are only read from env, never stored or logged.
 */
function getConfig(env = process.env) {
  const dataDir =
    env.SHORTS_ANALYTICS_DIR ||
    path.join(os.homedir(), '.arcadeum-shorts-analytics');
  return {
    dataDir,
    historyPath:
      env.SHORTS_ANALYTICS_FILE || path.join(dataDir, 'history.json'),
    manifestPath:
      env.SHORTS_ANALYTICS_MANIFEST || path.join(dataDir, 'manifest.ndjson'),
    postizBaseUrl:
      env.POSTIZ_BASE_URL || 'https://postiz.arcadeum.games/api/public/v1',
    postizApiKey: env.POSTIZ_API_KEY || '',
    // Do not fetch stats for posts younger than this.
    minAgeHours: Number(env.SHORTS_ANALYTICS_MIN_AGE_HOURS || 24),
    // Stop refreshing posts older than this (numbers are stable by then).
    maxAgeDays: Number(env.SHORTS_ANALYTICS_MAX_AGE_DAYS || 14),
    // Do not re-fetch a post more often than this.
    refreshIntervalHours: Number(env.SHORTS_ANALYTICS_REFRESH_HOURS || 12),
    // Minimum samples per format before getFormatWeights trusts the data.
    minSamples: Number(env.SHORTS_ANALYTICS_MIN_SAMPLES || 3),
    // Postiz analytics window in days.
    statsWindowDays: Number(env.SHORTS_ANALYTICS_WINDOW_DAYS || 30),
  };
}

module.exports = { getConfig };
