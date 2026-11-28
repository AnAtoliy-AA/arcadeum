import type { Alert, Logger } from './types';

type FetchFn = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<unknown>;

export interface AlerterOptions {
  url: string;
  cooldownMs?: number;
  fetchFn?: FetchFn;
  now?: () => number;
  log?: Logger;
}

/**
 * Alert webhook hook (STREAM_ALERT_WEBHOOK_URL). The body carries both
 * `text` (Slack/Telegram relay style) and `content` (Discord style) so the
 * same URL can point at either relay. Cooldown per key avoids spam.
 * No secrets are ever put in a message.
 */
export function createAlerter({
  url,
  cooldownMs = 300_000,
  fetchFn = (u, init) => fetch(u, init),
  now = Date.now,
  log,
}: AlerterOptions): Alert {
  const last = new Map<string, number>();
  return async (key, message, extra = {}) => {
    if (!url) return false;
    const t = now();
    const prev = last.get(key);
    if (prev !== undefined && t - prev < cooldownMs) return false;
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
      log?.warn('alert webhook failed', { error: (err as Error).message });
      return false;
    }
  };
}
