import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCountUp } from './useCountUp';

describe('useCountUp', () => {
  beforeEach(() => {
    // Force the reduced-motion branch so the hook snaps (no real animation) and
    // run rAF synchronously so the snap is observable right after rerender.
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('snaps to the initial target on first render', () => {
    const { result } = renderHook(({ t }) => useCountUp(t), {
      initialProps: { t: 100 },
    });
    expect(result.current).toBe(100);
  });

  it('jumps straight to the new target under reduced motion', () => {
    const { result, rerender } = renderHook(({ t }) => useCountUp(t), {
      initialProps: { t: 100 },
    });
    rerender({ t: 250 });
    expect(result.current).toBe(250);
  });
});
