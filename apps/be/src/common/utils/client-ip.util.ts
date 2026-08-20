import type { Request } from 'express';

/**
 * Resolve the real client IP for rate limiting / abuse tracking.
 *
 * Precedence:
 *  1. `CF-Connecting-IP` — set by Cloudflare when the origin sits behind
 *     it. Cloudflare overwrites this header on every proxied request, so
 *     it cannot be spoofed through the proxy.
 *  2. `req.ip` — Express with `trust proxy` resolves this to the
 *     left-most *untrusted* address, i.e. the true client when nginx is
 *     the single trusted hop (which is the current production topology).
 *
 * We deliberately do NOT parse `X-Forwarded-For` manually: with nginx's
 * `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for` a direct
 * client can inject an arbitrary leading entry, which would let it spoof
 * its own rate-limit bucket (or frame another user's IP). `req.ip`
 * already applies the trusted-proxy logic correctly.
 */
export function extractClientIp(req: Request): string {
  const cf = req.headers['cf-connecting-ip'];
  if (typeof cf === 'string' && cf.trim().length > 0) {
    return cf.trim();
  }
  return req.ip ?? req.socket?.remoteAddress ?? 'unknown';
}
