import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useShowCoordinates } from './board-preferences';

describe('useShowCoordinates', () => {
  beforeEach(() => window.localStorage.clear());

  it('defaults to showing coordinates', () => {
    const { result } = renderHook(() => useShowCoordinates());
    expect(result.current.showCoordinates).toBe(true);
  });

  it('persists the choice and updates every subscriber', () => {
    const a = renderHook(() => useShowCoordinates());
    const b = renderHook(() => useShowCoordinates());
    act(() => a.result.current.setShowCoordinates(false));
    expect(a.result.current.showCoordinates).toBe(false);
    expect(b.result.current.showCoordinates).toBe(false);
    expect(window.localStorage.getItem('arcadeum:chess:showCoordinates')).toBe(
      'false',
    );
    act(() => a.result.current.setShowCoordinates(true));
    expect(b.result.current.showCoordinates).toBe(true);
  });
});
