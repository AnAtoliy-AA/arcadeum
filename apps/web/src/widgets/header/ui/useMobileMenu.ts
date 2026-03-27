import { useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useClickOutside } from './useClickOutside';

export function useMobileMenu(): {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
} {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Close the menu on navigation. useEffect (post-render) rather than the
  // render-phase prevPathname pattern from the original HeaderInteractive —
  // the one-tick delay is acceptable for a menu-close on navigation.
  useEffect(() => {
    close();
  }, [pathname, close]);

  useClickOutside(close, isOpen);

  return { isOpen, toggle, close };
}
