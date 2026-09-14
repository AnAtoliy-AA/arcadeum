/**
 * Resolve an asset path to a CDN URL when `NEXT_PUBLIC_CDN_URL` is set.
 * Falls back to the original path (serves from Next.js public/) in local dev
 * or environments without a CDN.
 */
export function resolveAssetUrl(path: string): string {
  const cdn = (process.env.NEXT_PUBLIC_CDN_URL || '').replace(/\/+$/, '');
  if (!cdn) return path;
  return `${cdn}${path.startsWith('/') ? path : `/${path}`}`;
}
