import { useEffect } from 'react';

export function useClickOutside(onClose: () => void, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest('[data-mobile-menu]') &&
        !target.closest('[data-mobile-menu-button]')
      ) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [enabled, onClose]);
}
