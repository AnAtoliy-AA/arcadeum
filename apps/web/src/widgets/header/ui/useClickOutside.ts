import { useEffect } from 'react';

export function useClickOutside(onClose: () => void, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Ignore clicks inside the menu, the toggle, or any portaled popover/
      // listbox/menu/dialog content (e.g. the language Select dropdown that
      // Tamagui renders outside the menu DOM tree).
      if (
        target.closest('[data-mobile-menu]') ||
        target.closest('[data-mobile-menu-button]') ||
        target.closest('[role="listbox"]') ||
        target.closest('[role="menu"]') ||
        target.closest('[role="dialog"]') ||
        target.closest('[data-radix-popper-content-wrapper]')
      ) {
        return;
      }
      onClose();
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [enabled, onClose]);
}
