import type { Vec2 } from '../../types';

/**
 * Linearly interpolate between two segment polylines.
 *
 * If lengths differ (e.g. a worm grew between snapshots) the `next` polyline
 * is returned as-is — the renderer takes the snap rather than morphing tail
 * lengths mid-frame.
 */
export function interpolateSegments(
  prev: Vec2[],
  next: Vec2[],
  t: number,
): Vec2[] {
  if (prev.length !== next.length) return next;
  const tt = clamp01(t);
  const out: Vec2[] = new Array(next.length);
  for (let i = 0; i < next.length; i++) {
    const p = prev[i];
    const n = next[i];
    out[i] = {
      x: p.x + (n.x - p.x) * tt,
      y: p.y + (n.y - p.y) * tt,
    };
  }
  return out;
}

/**
 * Compute the render-time we should display, given the latest server-time we
 * have a snapshot for. We deliberately render `renderDelayMs` behind the
 * latest server-time so we always have a snapshot pair to interpolate
 * between.
 */
export function selectRenderTime(
  latestServerTime: number,
  renderDelayMs: number,
  _now: number,
): number {
  void _now; // reserved for future drift correction
  return latestServerTime - renderDelayMs;
}

/**
 * Compute t ∈ [0, 1] for interpolation between snapshots taken at `prevTime`
 * and `nextTime`, given the desired `renderTime`. Always clamped to [0, 1].
 */
export function computeT(
  prevTime: number,
  nextTime: number,
  renderTime: number,
): number {
  const span = nextTime - prevTime;
  if (span <= 0) return 1;
  return clamp01((renderTime - prevTime) / span);
}

function clamp01(x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x;
}
