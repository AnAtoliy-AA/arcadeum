'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Announces route changes to screen readers via a live region. When the
 * pathname changes, a visually hidden <div> updates its text content so
 * assistive technology announces the navigation. This satisfies WCAG 2.4.3
 * (Focus Order) by ensuring keyboard-only users know the page changed.
 */
export function RouteChangeAnnouncer() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const announcerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      if (announcerRef.current) {
        announcerRef.current.textContent = '';
        requestAnimationFrame(() => {
          if (announcerRef.current) {
            announcerRef.current.textContent = `Navigated to ${pathname}`;
          }
        });
      }
    }
  }, [pathname]);

  return (
    <div
      ref={announcerRef}
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      suppressHydrationWarning
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    />
  );
}
