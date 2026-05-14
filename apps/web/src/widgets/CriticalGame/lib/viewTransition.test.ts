import { afterEach, describe, expect, it, vi } from 'vitest';
import { withViewTransition } from './viewTransition';

type DocStore = Record<string, unknown>;
const originalMatchMedia = window.matchMedia;

function mockMatchMedia(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  }));
}

describe('withViewTransition', () => {
  afterEach(() => {
    delete (document as unknown as DocStore).startViewTransition;
    window.matchMedia = originalMatchMedia;
  });

  it('runs the callback synchronously when startViewTransition is absent', () => {
    const fn = vi.fn();
    withViewTransition(fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('delegates to document.startViewTransition when available', () => {
    mockMatchMedia(false);
    const wrappedCallbacks: Array<() => void | Promise<void>> = [];
    (document as unknown as DocStore).startViewTransition = vi
      .fn()
      .mockImplementation((cb: () => void | Promise<void>) => {
        wrappedCallbacks.push(cb);
        return { ready: Promise.resolve() };
      });

    const fn = vi.fn();
    withViewTransition(fn);
    expect(wrappedCallbacks).toHaveLength(1);
    // The browser would invoke this; we drive it manually to confirm
    // the wrapping doesn't drop the callback.
    wrappedCallbacks[0]();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('skips the view transition when prefers-reduced-motion is set', () => {
    // §1.3 — motion-sensitive users shouldn't get the cross-fade. The
    // callback still runs (state must mutate), but the browser
    // animation is bypassed.
    mockMatchMedia(true);
    const startSpy = vi.fn();
    (document as unknown as DocStore).startViewTransition = startSpy;
    const fn = vi.fn();
    withViewTransition(fn);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(startSpy).not.toHaveBeenCalled();
  });
});
