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

  return { isOpen, toggle, close };
}
