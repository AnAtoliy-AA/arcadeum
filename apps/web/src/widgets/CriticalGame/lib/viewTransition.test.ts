import { afterEach, describe, expect, it, vi } from 'vitest';
import { withViewTransition } from './viewTransition';

describe('withViewTransition', () => {
  afterEach(() => {
    delete (document as unknown as Record<string, unknown>).startViewTransition;
  });

  it('runs the callback synchronously when startViewTransition is absent', () => {
    const fn = vi.fn();
    withViewTransition(fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('delegates to document.startViewTransition when available', () => {
    const wrappedCallbacks: Array<() => void | Promise<void>> = [];
    (document as unknown as Record<string, unknown>).startViewTransition = vi
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
});
