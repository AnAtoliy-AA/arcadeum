import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePageVisible } from './usePageVisible';

function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => hidden,
  });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('usePageVisible', () => {
  it('tracks document visibility', () => {
    const { result } = renderHook(() => usePageVisible());
    expect(result.current).toBe(true);
    act(() => setHidden(true));
    expect(result.current).toBe(false);
    act(() => setHidden(false));
    expect(result.current).toBe(true);
  });
});
