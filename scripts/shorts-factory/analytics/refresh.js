'use strict';

const { getConfig } = require('./config');
const { readHistory, writeHistory } = require('./store');
const { fetchPostStats } = require('./postiz');

const HOUR = 3600 * 1000;

function isDue(record, cfg, now) {
  if (!record.posts || !record.posts.length) return false;
  const age = now - new Date(record.date).getTime();
  if (age < cfg.minAgeHours * HOUR) return false;
  if (age > cfg.maxAgeDays * 24 * HOUR) return false;
  if (record.statsFetchedAt) {
    const since = now - new Date(record.statsFetchedAt).getTime();
    if (since < cfg.refreshIntervalHours * HOUR) return false;
  }
  return true;
}

/**
 * Refresh stats of posts old enough (default >= 24h) and not stale.
 * Per-post failures are isolated and returned, never thrown.
 */
async function refreshStats(opts = {}) {
  const cfg = opts.config || getConfig();
  const historyPath = opts.historyPath || cfg.historyPath;
  const now = opts.now || Date.now();
  const fetchStats = opts.fetchStats || fetchPostStats;
  const records = readHistory(historyPath);
  const result = { refreshed: 0, skipped: 0, errors: [] };

  for (const record of records) {
    if (!isDue(record, cfg, now)) {
      result.skipped += 1;
      continue;
    }
    const byPost = {};
    for (const p of record.posts) {
      try {
        byPost[`${p.platform}:${p.postId}`] = await fetchStats(p.postId, {
          config: cfg,
          httpGet: opts.httpGet,
        });
      } catch (err) {
        result.errors.push({
          id: record.id,
          postId: p.postId,
          error: err.message,
        });
      }
    }
    if (Object.keys(byPost).length) {
      record.stats = { byPost };
      record.statsFetchedAt = new Date(now).toISOString();
      result.refreshed += 1;
    }
  }
  writeHistory(records, historyPath);
  return result;
}

module.exports = { refreshStats, isDue };
