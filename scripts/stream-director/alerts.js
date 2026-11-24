'use strict';

/**
 * Alert webhook hook (STREAM_ALERT_WEBHOOK_URL). The body carries both
 * `text` (Slack/Telegram relay style) and `content` (Discord style) so the
 * same URL can point at either relay. Cooldown per key avoids spam.
 * Only mocked in tests; no secrets are ever put in a message.
 */
function createAlerter({
  url,
  cooldownMs = 300_000,
  fetchFn = globalThis.fetch,
  now = Date.now,
  log,
}) {
  const last = new Map();
  return async function alert(key, message, extra = {}) {
    if (!url) return false;
    const t = now();
    if (last.has(key) && t - last.get(key) < cooldownMs) return false;
    last.set(key, t);
    const text = `[arcadeum-stream] ${message}`;
    try {
      await fetchFn(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          text,
          content: text,
          source: 'arcadeum-stream',
          key,
          ...extra,
        }),
      });
      return true;
    } catch (err) {
      log?.warn('alert webhook failed', { error: err.message });
      return false;
    }
  };
}

module.exports = { createAlerter };
