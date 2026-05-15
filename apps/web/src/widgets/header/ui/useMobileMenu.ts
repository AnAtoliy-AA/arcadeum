import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useClickOutside } from './useClickOutside';

export function useMobileMenu(): {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
} {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close the menu when the pathname changes.
  // We do this during render to satisfy the 'no-set-state-in-effect' lint rule
  // and ensure the menu is closed properly before the next paint.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (isOpen) {
      setIsOpen(false);
    }
  }

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useClickOutside(close, isOpen);

  // Lock body scroll while the drawer is open. Without this, scrolling the
  // drawer's content chains to the page on mobile browsers, dragging the
  // sticky header out of view and revealing the layout below the menu.
  useEffect(() => {
    if (!isOpen) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevOverscroll = body.style.overscrollBehavior;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'contain';
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.overscrollBehavior = prevOverscroll;
    };
  }, [isOpen]);

  return { isOpen, toggle, close };
}
