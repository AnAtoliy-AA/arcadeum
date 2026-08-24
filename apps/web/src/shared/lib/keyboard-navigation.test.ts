import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  ARROW_KEYS,
  ACTIVATION_KEYS,
  BOARD_CELL_FOCUS_CLASS,
  isActivationKey,
  isArrowKey,
  isEscapeKey,
  useEscapeKey,
} from './keyboard-navigation';

describe('key predicates', () => {
  it('identifies arrow keys', () => {
    for (const key of ARROW_KEYS) expect(isArrowKey(key)).toBe(true);
    expect(isArrowKey('Enter')).toBe(false);
    expect(isArrowKey('a')).toBe(false);
    expect(isArrowKey('ArrowUp')).toBe(true);
  });

  it('identifies activation keys', () => {
    for (const key of ACTIVATION_KEYS) expect(isActivationKey(key)).toBe(true);
    expect(isActivationKey('Spacebar')).toBe(false);
    expect(isActivationKey('Escape')).toBe(false);
  });

  it('identifies the Escape key', () => {
    expect(isEscapeKey('Escape')).toBe(true);
    expect(isEscapeKey('Esc')).toBe(false);
    expect(isEscapeKey('Enter')).toBe(false);
  });
});

describe('BOARD_CELL_FOCUS_CLASS', () => {
  it('exposes focus-visible outline classes driven by the primary token', () => {
    expect(BOARD_CELL_FOCUS_CLASS).toContain('focus-visible:outline-2');
    expect(BOARD_CELL_FOCUS_CLASS).toContain('outline-[var(--primary)]');
  });
});

describe('useEscapeKey', () => {
  it('calls the handler when Escape is pressed', () => {
    const handler = vi.fn();
    renderHook(() => useEscapeKey(handler));
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call the handler for other keys', () => {
    const handler = vi.fn();
    renderHook(() => useEscapeKey(handler));
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not call the handler when disabled', () => {
    const handler = vi.fn();
    renderHook(() => useEscapeKey(handler, false));
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('invokes the latest handler after re-render', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ handler }) => useEscapeKey(handler),
      { initialProps: { handler: first } },
    );
    rerender({ handler: second });
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('removes the listener on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useEscapeKey(handler));
    unmount();
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(handler).not.toHaveBeenCalled();
  });
});
