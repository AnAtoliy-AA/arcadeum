import { describe, expect, it } from 'vitest';
import {
  computeT,
  interpolateSegments,
  selectRenderTime,
} from './interpolation';

describe('interpolateSegments', () => {
  const a = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ];
  const b = [
    { x: 100, y: 50 },
    { x: 110, y: 50 },
  ];

  it('returns prev when t=0', () => {
    expect(interpolateSegments(a, b, 0)).toEqual(a);
  });

  it('returns next when t=1', () => {
    expect(interpolateSegments(a, b, 1)).toEqual(b);
  });

  it('returns midpoints at t=0.5', () => {
    expect(interpolateSegments(a, b, 0.5)).toEqual([
      { x: 50, y: 25 },
      { x: 60, y: 25 },
    ]);
  });

  it('clamps t below 0 to 0 (returns prev)', () => {
    expect(interpolateSegments(a, b, -1)).toEqual(a);
  });

  it('clamps t above 1 to 1 (returns next)', () => {
    expect(interpolateSegments(a, b, 5)).toEqual(b);
  });

  it('returns next as-is when lengths differ (no morph)', () => {
    const longer = [...b, { x: 120, y: 50 }];
    expect(interpolateSegments(a, longer, 0.5)).toEqual(longer);
  });
});

describe('computeT', () => {
  it('returns 0 when renderTime is at prevTime', () => {
    expect(computeT(100, 200, 100)).toBe(0);
  });

  it('returns 1 when renderTime is at nextTime', () => {
    expect(computeT(100, 200, 200)).toBe(1);
  });

  it('returns 0.5 in the middle', () => {
    expect(computeT(100, 200, 150)).toBe(0.5);
  });

  it('clamps below 0 to 0', () => {
    expect(computeT(100, 200, 50)).toBe(0);
  });

  it('clamps above 1 to 1', () => {
    expect(computeT(100, 200, 500)).toBe(1);
  });

  it('returns 1 when prev and next have the same time (degenerate)', () => {
    expect(computeT(100, 100, 100)).toBe(1);
  });
});

describe('selectRenderTime', () => {
  it('returns latestServerTime - renderDelayMs', () => {
    expect(selectRenderTime(1000, 100, 2000)).toBe(900);
  });
});
