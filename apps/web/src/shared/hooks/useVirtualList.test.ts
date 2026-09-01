import { renderHook, act } from '@testing-library/react';
import { useVirtualList } from './useVirtualList';

describe('useVirtualList', () => {
  it('calculates virtual items and total height correctly', () => {
    const { result } = renderHook(() =>
      useVirtualList(100, { itemHeight: 40, containerHeight: 200, overscan: 1 }),
    );

    expect(result.current.totalHeight).toBe(4000);
    expect(result.current.virtualItems.length).toBeGreaterThan(0);
    expect(result.current.virtualItems[0].offsetTop).toBe(0);
  });

  it('updates visible range when scrolled', () => {
    const { result } = renderHook(() =>
      useVirtualList(100, { itemHeight: 50, containerHeight: 200, overscan: 2 }),
    );

    act(() => {
      result.current.onScroll({
        currentTarget: { scrollTop: 500 },
      } as React.UIEvent<HTMLDivElement>);
    });

    expect(result.current.startIndex).toBe(8);
  });
});
