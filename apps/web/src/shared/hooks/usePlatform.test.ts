import { renderHook } from '@testing-library/react';
import { usePlatform } from './usePlatform';
import { describe, it, expect, vi } from 'vitest';

describe('usePlatform', () => {
  it('detects iOS correctly', () => {
    const spy = vi.spyOn(window.navigator, 'userAgent', 'get');
    spy.mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    );

    const { result } = renderHook(() => usePlatform());
    expect(result.current.isIos).toBe(true);
    expect(result.current.isAndroid).toBe(false);

    spy.mockRestore();
  });

  it('detects Android correctly', () => {
    const spy = vi.spyOn(window.navigator, 'userAgent', 'get');
    spy.mockReturnValue('Mozilla/5.0 (Linux; Android 10; SM-G973F)');

    const { result } = renderHook(() => usePlatform());
    expect(result.current.isAndroid).toBe(true);
    expect(result.current.isIos).toBe(false);

    spy.mockRestore();
  });

  it('returns false for other platforms', () => {
    const spy = vi.spyOn(window.navigator, 'userAgent', 'get');
    spy.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

    const { result } = renderHook(() => usePlatform());
    expect(result.current.isIos).toBe(false);
    expect(result.current.isAndroid).toBe(false);

    spy.mockRestore();
  });
});
