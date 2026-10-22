import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePachisiKeyboardTurn } from './usePachisiKeyboardTurn';

describe('usePachisiKeyboardTurn', () => {
  it('calls onMove with sole token id on Space key press', () => {
    const handleMove = vi.fn();
    const handlePass = vi.fn();

    renderHook(() =>
      usePachisiKeyboardTurn({
        myTurn: true,
        isGameOver: false,
        actionBusy: false,
        canMove: true,
        movableTokenIds: new Set([2]),
        onPassTurn: handlePass,
        onMove: handleMove,
      }),
    );

    window.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'Space', key: ' ' }),
    );

    expect(handleMove).toHaveBeenCalledWith(2);
    expect(handlePass).not.toHaveBeenCalled();
  });

  it('calls onPassTurn when no tokens are movable on Space key press', () => {
    const handleMove = vi.fn();
    const handlePass = vi.fn();

    renderHook(() =>
      usePachisiKeyboardTurn({
        myTurn: true,
        isGameOver: false,
        actionBusy: false,
        canMove: true,
        movableTokenIds: new Set(),
        onPassTurn: handlePass,
        onMove: handleMove,
      }),
    );

    window.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'Space', key: ' ' }),
    );

    expect(handlePass).toHaveBeenCalledTimes(1);
    expect(handleMove).not.toHaveBeenCalled();
  });

  it('does nothing on Space when multiple tokens are movable', () => {
    const handleMove = vi.fn();
    const handlePass = vi.fn();

    renderHook(() =>
      usePachisiKeyboardTurn({
        myTurn: true,
        isGameOver: false,
        actionBusy: false,
        canMove: true,
        movableTokenIds: new Set([0, 1]),
        onPassTurn: handlePass,
        onMove: handleMove,
      }),
    );

    window.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'Space', key: ' ' }),
    );

    expect(handleMove).not.toHaveBeenCalled();
    expect(handlePass).not.toHaveBeenCalled();
  });
});
