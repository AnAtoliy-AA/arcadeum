import { describe, it, expect, vi } from 'vitest';
import { render, renderHook, act } from '@testing-library/react';
import {
  LiveRegion,
  useAnnouncer,
  useBoardKeyboardNavigation,
  boardCellLabel,
} from './a11y';

describe('LiveRegion', () => {
  it('renders the message in a polite live region', () => {
    const { getByTestId } = render(<LiveRegion message="Your turn" />);
    const region = getByTestId('a11y-live-region');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('role', 'status');
    expect(region).toHaveAttribute('aria-atomic', 'true');
    expect(region.textContent).toBe('Your turn');
  });

  it('uses an assertive live region when requested', () => {
    const { getByTestId } = render(
      <LiveRegion message="Checkmate" assertive />,
    );
    expect(getByTestId('a11y-live-region')).toHaveAttribute(
      'aria-live',
      'assertive',
    );
  });

  it('is visually hidden with sr-only class', () => {
    const { getByTestId } = render(<LiveRegion message="Game over" />);
    expect(getByTestId('a11y-live-region')).toHaveClass('sr-only');
  });
});

describe('useAnnouncer', () => {
  it('starts with no live region and announces a message', () => {
    const { result } = renderHook(() => useAnnouncer());
    expect(result.current.liveRegion).toBeNull();

    act(() => {
      result.current.announce('Check!');
    });

    expect(result.current.liveRegion).not.toBeNull();
    const { getByTestId } = render(result.current.liveRegion!);
    expect(getByTestId('a11y-live-region').textContent).toBe('Check!');
  });

  it('keeps the same message without unnecessary re-renders', () => {
    const { result } = renderHook(() => useAnnouncer());
    act(() => result.current.announce('Your turn'));
    const first = result.current.liveRegion;
    act(() => result.current.announce('Your turn'));
    expect(result.current.liveRegion).toBe(first);
  });

  it('updates the message when a different announcement is made', () => {
    const { result } = renderHook(() => useAnnouncer());
    act(() => result.current.announce('Your turn'));
    act(() => result.current.announce('Opponent moved'));
    const { getByTestId } = render(result.current.liveRegion!);
    expect(getByTestId('a11y-live-region').textContent).toBe('Opponent moved');
  });
});

describe('useBoardKeyboardNavigation', () => {
  const renderGrid = () => {
    const hook = renderHook(() =>
      useBoardKeyboardNavigation({
        rows: 8,
        cols: 8,
        onActivate: vi.fn(),
      }),
    );
    const { gridProps, getCellProps } = hook.result.current;
    return { hook, gridProps, getCellProps };
  };

  it('makes the grid focusable and cells reachable via roving tabindex', () => {
    const { gridProps, getCellProps } = renderGrid();
    expect(gridProps.tabIndex).toBe(0);

    const cellProps = getCellProps(0, 0);
    expect(cellProps.tabIndex).toBe(-1);
    expect(cellProps['data-board-cell']).toBe('0:0');
  });

  it('moves focus on arrow keys', () => {
    const { hook, gridProps } = renderGrid();
    const event = { key: 'ArrowRight', preventDefault: vi.fn() } as unknown as {
      key: string;
      preventDefault: () => void;
    };
    act(() => {
      gridProps.onKeyDown(event as never);
    });

    const nextCell = hook.result.current.getCellProps(0, 1);
    expect(nextCell.tabIndex).toBe(0);
    expect(hook.result.current.focused).toEqual({ row: 0, col: 1 });
  });

  it('clamps movement at the board edges', () => {
    const { hook, gridProps } = renderGrid();
    act(() => {
      gridProps.onKeyDown({ key: 'ArrowUp', preventDefault: vi.fn() } as never);
    });
    // focus is null initially -> base {0,0}, up clamps to row 0
    expect(hook.result.current.getCellProps(0, 0).tabIndex).toBe(0);
  });

  it('activates the focused cell on Enter/Space', () => {
    const onActivate = vi.fn();
    const { result } = renderHook(() =>
      useBoardKeyboardNavigation({ rows: 8, cols: 8, onActivate }),
    );
    act(() => {
      result.current.gridProps.onKeyDown({
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as never);
    });
    result.current.gridProps.onKeyDown({
      key: 'Enter',
      preventDefault: vi.fn(),
    } as never);
    expect(onActivate).toHaveBeenCalledWith({ row: 0, col: 1 });
  });

  it('does nothing when disabled', () => {
    const onActivate = vi.fn();
    const { result } = renderHook(() =>
      useBoardKeyboardNavigation({
        rows: 8,
        cols: 8,
        disabled: true,
        onActivate,
      }),
    );
    result.current.gridProps.onKeyDown({
      key: 'ArrowRight',
      preventDefault: vi.fn(),
    } as never);
    expect(result.current.focused).toBeNull();
    expect(result.current.gridProps.tabIndex).toBe(-1);
  });

  it('calls onDeselect on Escape when a cell is focused', () => {
    const onDeselect = vi.fn();
    const { result } = renderHook(() =>
      useBoardKeyboardNavigation({ rows: 8, cols: 8, onDeselect }),
    );
    act(() => {
      result.current.gridProps.onKeyDown({
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as never);
    });
    const preventDefault = vi.fn();
    result.current.gridProps.onKeyDown({
      key: 'Escape',
      preventDefault,
    } as never);
    expect(onDeselect).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('ignores Escape when no cell is focused or no handler given', () => {
    const onDeselect = vi.fn();
    const { result } = renderHook(() =>
      useBoardKeyboardNavigation({ rows: 8, cols: 8, onDeselect }),
    );
    result.current.gridProps.onKeyDown({
      key: 'Escape',
      preventDefault: vi.fn(),
    } as never);
    expect(onDeselect).not.toHaveBeenCalled();

    const withoutHandler = renderHook(() =>
      useBoardKeyboardNavigation({ rows: 8, cols: 8 }),
    );
    withoutHandler.result.current.gridProps.onKeyDown({
      key: 'Escape',
      preventDefault: vi.fn(),
    } as never);
    expect(onDeselect).not.toHaveBeenCalled();
  });
});

describe('boardCellLabel', () => {
  it('builds a coordinate label', () => {
    expect(boardCellLabel(0, 0)).toBe('1a');
    expect(boardCellLabel(2, 2)).toBe('3c');
  });

  it('supports prefix and suffix', () => {
    expect(boardCellLabel(1, 3, { prefix: 'Row', suffix: 'occupied' })).toBe(
      'Row 2d occupied',
    );
  });
});
