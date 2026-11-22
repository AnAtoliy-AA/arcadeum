import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useCriticalModals } from './useCriticalModals';
import { useCriticalGameStore } from '../store/criticalGameStore';

describe('useCriticalModals combo flows', () => {
  const playEventCombo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useCriticalGameStore.getState().reset();
  });

  it('confirms pair combo with cat, target, and blind card index', () => {
    const { result } = renderHook(() => useCriticalModals({ playEventCombo }));

    act(() => {
      useCriticalGameStore
        .getState()
        .openEventCombo(
          ['collection_alpha', 'collection_alpha'],
          ['collection_alpha', 'collection_alpha', 'strike'],
          'pair',
          'player-2',
        );
      useCriticalGameStore.getState().setSelectedIndex(1);
    });

    act(() => {
      result.current.handleConfirmEventCombo();
    });

    expect(playEventCombo).toHaveBeenCalledWith(
      'collection_alpha',
      'pair',
      'player-2',
      undefined,
      1,
    );
    expect(useCriticalGameStore.getState().eventComboModal).toBeNull();
  });

  it('confirms trio combo with cat, target, and desiredCard', () => {
    const { result } = renderHook(() => useCriticalModals({ playEventCombo }));

    act(() => {
      useCriticalGameStore
        .getState()
        .openEventCombo(
          ['collection_alpha', 'collection_alpha', 'collection_alpha'],
          ['collection_alpha', 'collection_alpha', 'collection_alpha'],
          'trio',
          'player-2',
        );
      useCriticalGameStore.getState().setSelectedCard('strike');
    });

    act(() => {
      result.current.handleConfirmEventCombo();
    });

    expect(playEventCombo).toHaveBeenCalledWith(
      'collection_alpha',
      'trio',
      'player-2',
      'strike',
    );
    expect(useCriticalGameStore.getState().eventComboModal).toBeNull();
  });

  it('confirms fiver combo with 5 cards and requested discard card', () => {
    const { result } = renderHook(() => useCriticalModals({ playEventCombo }));

    act(() => {
      useCriticalGameStore
        .getState()
        .openEventCombo(
          [],
          ['strike', 'evade', 'trade', 'reorder', 'cancel'],
          'fiver',
          undefined,
          ['strike', 'evade', 'trade', 'reorder', 'cancel'],
        );
      useCriticalGameStore.getState().setSelectedDiscardCard('neutralizer');
    });

    act(() => {
      result.current.handleConfirmEventCombo();
    });

    expect(playEventCombo).toHaveBeenCalledWith(
      null,
      'fiver',
      undefined,
      undefined,
      undefined,
      'neutralizer',
      ['strike', 'evade', 'trade', 'reorder', 'cancel'],
    );
    expect(useCriticalGameStore.getState().eventComboModal).toBeNull();
  });
});
