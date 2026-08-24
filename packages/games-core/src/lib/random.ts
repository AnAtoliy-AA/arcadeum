/**
 * Environment-agnostic randomness for game engines.
 *
 * Engines previously used node:crypto directly which is unavailable in the
 * browser. Web Crypto (`globalThis.crypto`) exists in all modern browsers and
 * Node >= 19; fall back to Math.random on exotic runtimes so offline play
 * never crashes.
 */

type CryptoLike = {
  getRandomValues<T extends ArrayBufferView>(array: T): T;
};

function getCrypto(): CryptoLike | null {
  const g = globalThis as { crypto?: Partial<CryptoLike> };
  if (
    g.crypto &&
    typeof g.crypto.getRandomValues === 'function'
  ) {
    return g.crypto as CryptoLike;
  }
  return null;
}

/** Uniform random integer in [0, max). Mirrors node:crypto randomInt(max). */
export function randomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0) {
    throw new Error(`randomInt: invalid max ${max}`);
  }
  const c = getCrypto();
  if (!c) return Math.floor(Math.random() * max);
  // Rejection sampling to avoid modulo bias.
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  let v = 0;
  do {
    c.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return v % max;
}

/** RFC4122 v4 UUID string. */
export function randomUUID(): string {
  const c = getCrypto() as (CryptoLike & { randomUUID?: () => string }) | null;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  const bytes = new Uint8Array(16);
  if (c) c.getRandomValues(bytes);
  else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex
    .slice(6, 8)
    .join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
}
