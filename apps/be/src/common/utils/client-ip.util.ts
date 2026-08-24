import type { Request } from 'express';

export interface ExtractClientIpOptions {
  /**
   * Trust the `CF-Connecting-IP` header. Only enable when the deployment
   * actually sits behind Cloudflare: Caddy does not sanitize client-supplied
   * `CF-Connecting-IP` headers, so trusting it elsewhere lets any caller
   * spoof its rate-limit bucket (or frame another IP).
   */
  trustCloudflare?: boolean;
}

/**
 * Resolve the real client IP for rate limiting / abuse tracking.
 *
 * Precedence:
 *  1. `CF-Connecting-IP` — only when `trustCloudflare` is enabled. Cloudflare
 *     overwrites this header on every proxied request, so behind Cloudflare
 *     it cannot be spoofed.
 *  2. `req.ip` — Express with `trust proxy` resolves this to the
 *     left-most *untrusted* address, i.e. the true client when there is a
 *     single trusted reverse proxy hop (the current production topology).
 *
 * We deliberately do NOT parse `X-Forwarded-For` manually: with nginx's
 * `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for` a direct
 * client can inject an arbitrary leading entry, which would let it spoof
 * its own rate-limit bucket (or frame another user's IP). `req.ip`
 * already applies the trusted-proxy logic correctly.
 */
export function extractClientIp(
  req: Request,
  options?: ExtractClientIpOptions,
): string {
  if (options?.trustCloudflare) {
    const cf = req.headers['cf-connecting-ip'];
    if (typeof cf === 'string' && cf.trim().length > 0) {
      return cf.trim();
    }
  }
  return req.ip ?? req.socket?.remoteAddress ?? 'unknown';
}
