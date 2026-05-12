import { useState, useCallback, useEffect, RefObject } from 'react';

/**
 * CSS-based "expand to viewport" mode. Avoids the real Fullscreen API on
 * purpose: that API renders only the fullscreen element and its descendants,
 * which hides body-level portals — and every modal in this app
 * (GameResultModal, RematchModal, etc.) ports through Dialog.Portal to body.
 * Toggling a class instead keeps the modal layer reachable.
 */
export function useFullscreen(containerRef: RefObject<HTMLDivElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    if (isFullscreen) {
      node.classList.add('is-fullscreen');
    } else {
      node.classList.remove('is-fullscreen');
    }
    return () => {
      node.classList.remove('is-fullscreen');
    };
  }, [containerRef, isFullscreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      if (isTyping) return;
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsFullscreen((prev) => (prev ? false : prev));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isFullscreen,
    toggleFullscreen,
  };
}
