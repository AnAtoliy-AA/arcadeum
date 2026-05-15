import axios, { type AxiosInstance } from 'axios';
import { Agent as HttpsAgent } from 'node:https';
import { Agent as HttpAgent } from 'node:http';

const DEFAULT_MAX_SOCKETS = 50;
const DEFAULT_KEEP_ALIVE_MS = 30_000;

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw.trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Shared axios instance for PayPal outbound calls.
 *
 * Why a custom agent: axios's default behavior creates a new connection per
 * request, and each Node `net.Socket` accumulates `disconnect`/`error`/
 * `close` listeners as requests flow through it. Under bursty subscription
 * or order traffic the global agent's pooled sockets can trip Node's
 * default 10-listener `EventEmitter` cap. An explicit keep-alive `Agent`
 * with `maxSockets` gives us:
 *
 * - bounded connection count (one socket per PayPal host up to the cap)
 * - reuse across requests (lower latency, no TLS handshake per call)
 * - a known place to bump `setMaxListeners` if the cap is hit
 *
 * Tunables: `PAYPAL_HTTP_MAX_SOCKETS`, `PAYPAL_HTTP_KEEP_ALIVE_MS`.
 */
export function createPaypalHttpClient(): AxiosInstance {
  const maxSockets = parsePositiveInt(
    process.env.PAYPAL_HTTP_MAX_SOCKETS,
    DEFAULT_MAX_SOCKETS,
  );
  const keepAliveMsecs = parsePositiveInt(
    process.env.PAYPAL_HTTP_KEEP_ALIVE_MS,
    DEFAULT_KEEP_ALIVE_MS,
  );

  const agentOptions = { keepAlive: true, keepAliveMsecs, maxSockets };
  return axios.create({
    httpsAgent: new HttpsAgent(agentOptions),
    httpAgent: new HttpAgent(agentOptions),
  });
}

export const paypalHttp: AxiosInstance = createPaypalHttpClient();
