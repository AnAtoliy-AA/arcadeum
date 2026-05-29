import { useState, useCallback, useEffect, RefObject } from 'react';

interface UseFullscreenOptions {
  /**
   * Register a global `f` / `Escape` keyboard shortcut. Multiple instances
   * mounted in the same page each listen on `document` and would all fire
   * on a single keypress, so only one instance per page should set this
   * (typically the page-level toggle in `GamePageLayout`).
   */
  enableKeyboard?: boolean;
}

/**
 * CSS-based "expand to viewport" mode. Avoids the real Fullscreen API on
 * purpose: that API renders only the fullscreen element and its descendants,
 * which hides body-level portals — and every modal in this app
 * (GameResultModal, RematchModal, etc.) ports through Dialog.Portal to body.
 * Toggling a class instead keeps the modal layer reachable.
 */
export function useFullscreen(
  containerRef: RefObject<HTMLDivElement | null>,
  options: UseFullscreenOptions = {},
) {
  const { enableKeyboard = false } = options;
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Unconditionally leave fullscreen. No-op when already exited, so callers
  // (e.g. the auto-exit-on-game-finish effect) can fire it safely without a
  // risk of toggling fullscreen back on.
  const exitFullscreen = useCallback(() => {
    setIsFullscreen((prev) => (prev ? false : prev));
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
    if (!enableKeyboard) return;
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
  }, [enableKeyboard]);

  return {
    isFullscreen,
    toggleFullscreen,
    exitFullscreen,
  };
}
