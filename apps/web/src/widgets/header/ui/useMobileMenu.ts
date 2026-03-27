import { useState, useCallback } from 'react';
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

  // Render-phase state update: close the menu when the pathname changes.
  // This mirrors the pattern from the original HeaderInteractive and avoids
  // triggering the react-hooks/set-state-in-effect lint rule.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useClickOutside(close, isOpen);

  return { isOpen, toggle, close };
}
