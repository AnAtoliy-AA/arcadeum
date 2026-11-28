import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { pointToSquare, usePointerPieceDrag } from './usePointerPieceDrag';

describe('pointToSquare', () => {
  it('maps corners for white orientation', () => {
    expect(pointToSquare(1, 1, 800, 800, false)).toEqual({
      file: 'a',
      rank: 8,
    });
    expect(pointToSquare(799, 799, 800, 800, false)).toEqual({
      file: 'h',
      rank: 1,
    });
  });

  it('maps corners for black orientation', () => {
    expect(pointToSquare(1, 1, 800, 800, true)).toEqual({
      file: 'h',
      rank: 1,
    });
    expect(pointToSquare(450, 350, 800, 800, true)).toEqual({
      file: 'd',
      rank: 4,
    });
  });

  it('returns null outside the board or for an empty rect', () => {
    expect(pointToSquare(-5, 10, 800, 800, false)).toBeNull();
    expect(pointToSquare(10, 801, 800, 800, false)).toBeNull();
    expect(pointToSquare(10, 10, 0, 0, false)).toBeNull();
  });
});

function pointer(
  x: number,
  y: number,
  extra: Partial<Record<string, unknown>> = {},
): ReactPointerEvent<HTMLDivElement> {
  return {
    clientX: x,
    clientY: y,
    pointerId: 1,
    button: 0,
    isPrimary: true,
    preventDefault: vi.fn(),
    currentTarget: { setPointerCapture: vi.fn() },
    ...extra,
  } as unknown as ReactPointerEvent<HTMLDivElement>;
}

function setup(canDrag = true) {
  const grid = {
    getBoundingClientRect: () =>
      ({ left: 0, top: 0, width: 800, height: 800 }) as DOMRect,
  } as HTMLDivElement;
  const onDragStart = vi.fn();
  const onDrop = vi.fn();
  const hook = renderHook(() =>
    usePointerPieceDrag({
      gridRef: { current: grid },
      isFlipped: false,
      enabled: true,
      canDrag: () => canDrag,
      onDragStart,
      onDrop,
    }),
  );
  return { hook, onDragStart, onDrop };
}

describe('usePointerPieceDrag', () => {
  it('drags a piece from e2 to e4', () => {
    const { hook, onDragStart, onDrop } = setup();
    // e2 centre: col 4, row 6 => (450, 650); e4 => (450, 450)
    act(() => hook.result.current.handlers.onPointerDown(pointer(450, 650)));
    act(() => hook.result.current.handlers.onPointerMove(pointer(450, 540)));
    expect(onDragStart).toHaveBeenCalledWith({ file: 'e', rank: 2 });
    expect(hook.result.current.drag?.over).toEqual({ file: 'e', rank: 3 });
    act(() => hook.result.current.handlers.onPointerUp(pointer(450, 450)));
    expect(onDrop).toHaveBeenCalledWith(
      { file: 'e', rank: 2 },
      { file: 'e', rank: 4 },
    );
    expect(hook.result.current.drag).toBeNull();
  });

  it('treats a small movement as a tap and leaves it to click handling', () => {
    const { hook, onDragStart, onDrop } = setup();
    act(() => hook.result.current.handlers.onPointerDown(pointer(450, 650)));
    act(() => hook.result.current.handlers.onPointerMove(pointer(452, 652)));
    act(() => hook.result.current.handlers.onPointerUp(pointer(452, 652)));
    expect(onDragStart).not.toHaveBeenCalled();
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('ignores presses on squares that cannot be dragged', () => {
    const { hook, onDragStart } = setup(false);
    act(() => hook.result.current.handlers.onPointerDown(pointer(450, 650)));
    act(() => hook.result.current.handlers.onPointerMove(pointer(450, 450)));
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('does not drop when the gesture is cancelled', () => {
    const { hook, onDrop } = setup();
    act(() => hook.result.current.handlers.onPointerDown(pointer(450, 650)));
    act(() => hook.result.current.handlers.onPointerMove(pointer(450, 500)));
    act(() => hook.result.current.handlers.onPointerCancel(pointer(450, 450)));
    expect(onDrop).not.toHaveBeenCalled();
    expect(hook.result.current.drag).toBeNull();
  });

  it('does not drop back onto the origin square', () => {
    const { hook, onDrop } = setup();
    act(() => hook.result.current.handlers.onPointerDown(pointer(450, 650)));
    act(() => hook.result.current.handlers.onPointerMove(pointer(450, 600)));
    act(() => hook.result.current.handlers.onPointerUp(pointer(460, 660)));
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('ignores secondary buttons', () => {
    const { hook, onDragStart } = setup();
    act(() =>
      hook.result.current.handlers.onPointerDown(
        pointer(450, 650, { button: 2 }),
      ),
    );
    act(() => hook.result.current.handlers.onPointerMove(pointer(450, 450)));
    expect(onDragStart).not.toHaveBeenCalled();
  });
});
