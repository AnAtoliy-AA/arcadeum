/** Exponential backoff: 1s, 2s, 4s ... capped. Pure. */
export function nextBackoff(
  attempt: number,
  { minMs = 1000, maxMs = 60_000 }: { minMs?: number; maxMs?: number } = {},
): number {
  return Math.min(maxMs, minMs * 2 ** Math.max(0, attempt));
}
