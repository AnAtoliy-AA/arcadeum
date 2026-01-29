import { renderHook, act } from '@testing-library/react';
import { useHapticsSetting } from './useHapticsSetting';
import { describe, it, expect, vi } from 'vitest';
import * as storage from '../lib/settings-storage';

describe('useHapticsSetting', () => {
  it('returns stored haptics preference', () => {
    vi.spyOn(storage, 'loadStoredSettings').mockReturnValue({
      hapticsEnabled: true,
    });
    const { result } = renderHook(() => useHapticsSetting());
    expect(result.current.hapticsEnabled).toBe(true);
  });

  it('updates haptics preference', () => {
    const saveSpy = vi.spyOn(storage, 'saveStoredSettings');
    const { result } = renderHook(() => useHapticsSetting());

    act(() => {
      result.current.setHapticsEnabled(false);
    });

    expect(saveSpy).toHaveBeenCalledWith({ hapticsEnabled: false });
  });
});
