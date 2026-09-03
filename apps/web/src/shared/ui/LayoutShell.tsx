'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const ConnectionBanner = dynamic(
  () => import('./ConnectionBanner').then((m) => m.ConnectionBanner),
  { ssr: false },
);

const GameMusic = dynamic(
  () => import('@/widgets/GameMusic').then((m) => m.GameMusic),
  { ssr: false },
);

function RouteChangeAnnouncer() {
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

export function LayoutShell({ children }: { children: ReactNode }) {
  // Header / main / footer are direct children of <body>, which is the
  // flex-column sticky-footer container (see styles/reset.scss). No extra
  // wrapper element is needed.
  return (
    <>
      <ConnectionBanner />
      <RouteChangeAnnouncer />
      {children}
      <GameMusic />
    </>
  );
}
