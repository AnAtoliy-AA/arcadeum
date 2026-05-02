import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useIsMounted } from './useIsMounted';

describe('useIsMounted', () => {
  // The SSR path (getServerSnapshot returning false) cannot be tested in jsdom —
  // useSyncExternalStore always uses the client snapshot in a browser-like environment.
  // The SSR behavior is verified implicitly by the Playwright e2e suite.
  it('returns true in a browser (jsdom) environment', () => {
    const { result } = renderHook(() => useIsMounted());
    expect(result.current).toBe(true);
  });
});
