import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockSearchParams = vi.fn();
vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams(),
}));

import { useWidgetMode } from './useWidgetMode';
import { WIDGET_MODE_STORAGE_KEY } from '../lib/widgetMode';

function fakeParams(value: string | null) {
  return { get: (_key: string) => value };
}

describe('useWidgetMode', () => {
  const originalEnv = process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE;

  afterEach(() => {
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = originalEnv;
    window.localStorage.clear();
    mockSearchParams.mockReset();
  });

  it('returns env-default when no URL param or storage is set', () => {
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = 'true';
    mockSearchParams.mockReturnValue(fakeParams(null));
    const { result } = renderHook(() => useWidgetMode());
    expect(result.current).toBe(true);
  });

  it('returns false by default when nothing configured', () => {
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = undefined;
    mockSearchParams.mockReturnValue(fakeParams(null));
    const { result } = renderHook(() => useWidgetMode());
    expect(result.current).toBe(false);
  });

  it('URL param overrides env', () => {
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = 'false';
    mockSearchParams.mockReturnValue(fakeParams('1'));
    const { result } = renderHook(() => useWidgetMode());
    expect(result.current).toBe(true);
  });

  it('persists URL param into localStorage', () => {
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = undefined;
    mockSearchParams.mockReturnValue(fakeParams('1'));
    renderHook(() => useWidgetMode());
    expect(window.localStorage.getItem(WIDGET_MODE_STORAGE_KEY)).toBe('1');
  });

  it('reads from localStorage when no URL param is present', () => {
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = 'false';
    window.localStorage.setItem(WIDGET_MODE_STORAGE_KEY, '1');
    mockSearchParams.mockReturnValue(fakeParams(null));
    const { result } = renderHook(() => useWidgetMode());
    // useSyncExternalStore reads the client snapshot on the first render,
    // so storage takes effect immediately after the env fallback.
    expect(result.current).toBe(true);
  });
});
