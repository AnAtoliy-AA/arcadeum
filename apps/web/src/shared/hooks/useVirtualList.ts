'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';

export interface UseVirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export interface VirtualItem {
  index: number;
  offsetTop: number;
}

export function useVirtualList(
  itemCount: number,
  options: UseVirtualListOptions,
) {
  const { itemHeight, containerHeight, overscan = 3 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = itemCount * itemHeight;

  const { virtualItems, startIndex, endIndex } = useMemo(() => {
    const start = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan,
    );
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(
      itemCount - 1,
      start + visibleCount + overscan * 2,
    );

    const items: VirtualItem[] = [];
    for (let i = start; i <= end; i++) {
      items.push({
        index: i,
        offsetTop: i * itemHeight,
      });
    }

    return { virtualItems: items, startIndex: start, endIndex: end };
  }, [scrollTop, itemHeight, containerHeight, overscan, itemCount]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleNativeScroll = () => {
      setScrollTop(el.scrollTop);
    };
    el.addEventListener('scroll', handleNativeScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleNativeScroll);
    };
  }, []);

  return {
    containerRef,
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    onScroll,
  };
}
