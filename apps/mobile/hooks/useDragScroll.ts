import { useEffect, useRef } from 'react';
import { Platform, type ScrollView } from 'react-native';

type EnsureScrollableNode<T> = T & {
  getScrollableNode?: () => HTMLElement | null;
  getInnerViewNode?: () => HTMLElement | null;
};

export type DragScrollDirection = 'horizontal' | 'vertical';

export type UseDragScrollOptions = {
  dependencyKey?: string | number | boolean;
  hideScrollbar?: boolean;
  enableWheelScroll?: boolean;
  direction?: DragScrollDirection;
};

const SCROLL_STYLE_ID = 'drag-scroll-hide';
const SCROLL_DATA_ATTRIBUTE = 'data-drag-scroll';

function ensureHiddenScrollbarStyle() {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.getElementById(SCROLL_STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = SCROLL_STYLE_ID;
  style.textContent = `
    [${SCROLL_DATA_ATTRIBUTE}]::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }
  `;
  document.head.appendChild(style);
}

export function useDragScroll<T extends ScrollView>(
  options: UseDragScrollOptions = {},
) {
  const {
    dependencyKey,
    hideScrollbar = true,
    enableWheelScroll = true,
    direction = 'horizontal',
  } = options;
  const scrollRef = useRef<T | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const scrollView = scrollRef.current as EnsureScrollableNode<T> | null;
    const node =
      scrollView?.getScrollableNode?.() ??
      scrollView?.getInnerViewNode?.() ??
      null;
    if (!node) {
      return;
    }

    const isHorizontal = direction === 'horizontal';
    const scrollPositionKey = isHorizontal ? 'scrollLeft' : 'scrollTop';

    let originalScrollbarWidth: string | null = null;
    let originalMsOverflowStyle: string | null = null;
    if (hideScrollbar) {
      ensureHiddenScrollbarStyle();
      node.setAttribute(SCROLL_DATA_ATTRIBUTE, direction);
      originalScrollbarWidth = node.style.getPropertyValue('scrollbar-width');
      originalMsOverflowStyle = node.style.getPropertyValue(
        'ms-overflow-style',
      );
      node.style.setProperty('scrollbar-width', 'none');
      node.style.setProperty('ms-overflow-style', 'none');
    }

    const originalCursor = node.style.cursor;
    const originalUserSelect = node.style.userSelect;
    if (!originalCursor) {
      node.style.cursor = 'grab';
    }

    let pointerActive = false;
    let pointerId: number | null = null;
    let dragStartCoord = 0;
    let dragStartScrollPosition = 0;

    const handleWheel = (event: WheelEvent) => {
      if (!enableWheelScroll) {
        return;
      }

      const delta = isHorizontal
        ? Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY
        : event.deltaY;

      if (delta === 0) {
        return;
      }

      event.preventDefault();
      if (isHorizontal) {
        node.scrollLeft += delta;
      } else {
        node.scrollTop += delta;
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }

      pointerActive = true;
      pointerId = event.pointerId;
      dragStartCoord = isHorizontal ? event.clientX : event.clientY;
      dragStartScrollPosition = node[scrollPositionKey];
      node.setPointerCapture?.(event.pointerId);
      node.style.cursor = 'grabbing';
      node.style.userSelect = 'none';
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerActive) {
        return;
      }

      const currentCoord = isHorizontal ? event.clientX : event.clientY;
      const delta = currentCoord - dragStartCoord;

      if (isHorizontal) {
        node.scrollLeft = dragStartScrollPosition - delta;
      } else {
        node.scrollTop = dragStartScrollPosition - delta;
      }

      event.preventDefault();
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (!pointerActive || (pointerId !== null && event.pointerId !== pointerId)) {
        return;
      }

      pointerActive = false;
      pointerId = null;
      node.releasePointerCapture?.(event.pointerId);
      node.style.cursor = 'grab';
      node.style.userSelect = originalUserSelect || '';
    };

    if (enableWheelScroll) {
      node.addEventListener('wheel', handleWheel, { passive: false });
    }
    node.addEventListener('pointerdown', handlePointerDown);
    node.addEventListener('pointermove', handlePointerMove);
    node.addEventListener('pointerup', handlePointerEnd);
    node.addEventListener('pointerleave', handlePointerEnd);
    node.addEventListener('pointercancel', handlePointerEnd);

    return () => {
      if (enableWheelScroll) {
        node.removeEventListener('wheel', handleWheel);
      }
      node.removeEventListener('pointerdown', handlePointerDown);
      node.removeEventListener('pointermove', handlePointerMove);
      node.removeEventListener('pointerup', handlePointerEnd);
      node.removeEventListener('pointerleave', handlePointerEnd);
      node.removeEventListener('pointercancel', handlePointerEnd);

      if (hideScrollbar) {
        node.removeAttribute(SCROLL_DATA_ATTRIBUTE);
        if (originalScrollbarWidth) {
          node.style.setProperty('scrollbar-width', originalScrollbarWidth);
        } else {
          node.style.removeProperty('scrollbar-width');
        }
        if (originalMsOverflowStyle) {
          node.style.setProperty('ms-overflow-style', originalMsOverflowStyle);
        } else {
          node.style.removeProperty('ms-overflow-style');
        }
      }

      node.style.cursor = originalCursor;
      node.style.userSelect = originalUserSelect;
    };
  }, [dependencyKey, direction, enableWheelScroll, hideScrollbar]);

  return scrollRef;
}

export function useHorizontalDragScroll<T extends ScrollView>(
  options: Omit<UseDragScrollOptions, 'direction'> = {},
) {
  return useDragScroll<T>({ ...options, direction: 'horizontal' });
}

export function useVerticalDragScroll<T extends ScrollView>(
  options: Omit<UseDragScrollOptions, 'direction'> = {},
) {
  return useDragScroll<T>({ ...options, direction: 'vertical' });
}
