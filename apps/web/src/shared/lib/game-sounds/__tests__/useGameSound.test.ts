import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameSound } from '../useGameSound';
import { gameSounds } from '../GameSoundManager';

vi.mock('@/shared/hooks/useSoundSetting', () => ({
  useSoundSetting: vi.fn(() => ({ soundEnabled: true })),
}));

describe('useGameSound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes gameSounds and preloads registered sounds', () => {
    const initSpy = vi.spyOn(gameSounds, 'init');
    const preloadSpy = vi.spyOn(gameSounds, 'preload');

    renderHook(() => useGameSound('chess_v1'));

    expect(initSpy).toHaveBeenCalled();
    expect(preloadSpy).toHaveBeenCalledWith('chess_v1', expect.any(Array));
  });

  it('delegates play call to gameSounds', () => {
    const playSpy = vi.spyOn(gameSounds, 'play').mockImplementation(() => {});

    const { result } = renderHook(() => useGameSound('checkers_v1'));

    act(() => {
      result.current.play('move');
    });

    expect(playSpy).toHaveBeenCalledWith('move');
  });
});
