'use strict';

/**
 * Postiz public API analytics client.
 * GET {base}/analytics/post/{postId}?date={days} -> [{label, data:[{total,date}]}]
 * The HTTP function is injectable so tests never touch the network.
 */

const { getConfig } = require('./config');

const LABEL_MAP = [
  [/^(views?|impressions?|plays?|video views?)$/i, 'views'],
  [/^(likes?|reactions?)$/i, 'likes'],
  [/^comments?$/i, 'comments'],
  [/^(shares?|reposts?|retweets?)$/i, 'shares'],
  [/(link ?clicks?|clicks?)/i, 'linkClicks'],
  [/(avg|average).*(view|watch).*(duration|time)/i, 'avgViewDurationSec'],
  [/(watch ?time|view duration)/i, 'watchTimeSec'],
];

function sumSeries(series) {
  if (!Array.isArray(series)) return 0;
  return series.reduce((acc, p) => acc + (Number(p && p.total) || 0), 0);
}

/** Normalize a Postiz analytics payload into flat numeric stats. */
function normalizeStats(payload) {
  const stats = {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    linkClicks: 0,
    watchTimeSec: null,
    avgViewDurationSec: null,
  };
  if (!Array.isArray(payload)) return stats;
  for (const item of payload) {
    const label = String((item && item.label) || '').trim();
    const hit = LABEL_MAP.find(([re]) => re.test(label));
    if (!hit) continue;
    const key = hit[1];
    const series = item.data;
    if (key === 'avgViewDurationSec') {
      // averages are not additive: take the latest non-empty value
      const vals = (series || []).map((p) => Number(p.total) || 0);
      stats[key] = vals.length ? vals[vals.length - 1] : null;
    } else if (key === 'watchTimeSec') {
      stats[key] = (stats[key] || 0) + sumSeries(series);
    } else {
      stats[key] += sumSeries(series);
    }
  }
  return stats;
}

/** Real HTTP via axios (loaded lazily so tests do not need it). */
async function defaultHttpGet(url, headers) {
  const axios = require('axios');
  const res = await axios.get(url, { headers, timeout: 30000 });
  return res.data;
}

async function fetchPostStats(postId, opts = {}) {
  const cfg = opts.config || getConfig();
  if (!cfg.postizApiKey) throw new Error('POSTIZ_API_KEY must be set');
  const httpGet = opts.httpGet || defaultHttpGet;
  const url = `${cfg.postizBaseUrl}/analytics/post/${encodeURIComponent(postId)}?date=${cfg.statsWindowDays}`;
  const data = await httpGet(url, { Authorization: cfg.postizApiKey });
  return normalizeStats(data);
}

module.exports = { fetchPostStats, normalizeStats };
