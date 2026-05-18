'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

const CARD_STEP_PX = 392; // card width (360) + gap (32)
const DRAG_THRESHOLD_PX = 5;
const SCROLL_EDGE_TOLERANCE_PX = 10;

/**
 * Drag-to-scroll + arrow-button controls for the home games carousel.
 *
 * Returns a slot of values the carousel renders into:
 * - `sliderRef` for the scrollable track
 * - mouse handlers to install on the track
 * - `scrollBy(direction)` for the arrow buttons
 * - `canScrollLeft` / `canScrollRight` for arrow disabled state
 * - `isDragging` so the consumer can swap cursors
 * - `hasMoved` so click handlers inside the track can suppress click after drag
 */
export function useHomeGamesSlider() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const dragOriginRef = useRef({ startX: 0, scrollLeft: 0 });

  const checkScroll = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > SCROLL_EDGE_TOLERANCE_PX);
    setCanScrollRight(
      scrollLeft < scrollWidth - clientWidth - SCROLL_EDGE_TOLERANCE_PX,
    );
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  const handleMouseDown = useCallback((e: ReactMouseEvent) => {
    const el = sliderRef.current;
    if (!el) return;
    setIsDragging(true);
    setHasMoved(false);
    dragOriginRef.current = {
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
    };
    el.style.scrollBehavior = 'auto';
    el.style.scrollSnapType = 'none';
  }, []);

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent) => {
      const el = sliderRef.current;
      if (!isDragging || !el) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - dragOriginRef.current.startX) * 2;
      if (Math.abs(walk) > DRAG_THRESHOLD_PX) setHasMoved(true);
      el.scrollLeft = dragOriginRef.current.scrollLeft - walk;
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    setIsDragging(false);
    el.style.scrollBehavior = 'smooth';
    el.style.scrollSnapType = 'x mandatory';
    setTimeout(checkScroll, 100);
  }, [checkScroll]);

  const scrollBy = useCallback((direction: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    el.style.scrollBehavior = 'smooth';
    el.scrollBy({
      left: direction === 'left' ? -CARD_STEP_PX : CARD_STEP_PX,
      behavior: 'smooth',
    });
  }, []);

  return {
    sliderRef,
    canScrollLeft,
    canScrollRight,
    isDragging,
    hasMoved,
    checkScroll,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    scrollBy,
  };
}
