'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface GameStickyPlayBarProps {
  /** Id of the hero play panel; the bar shows once it scrolls out of view. */
  watchId: string;
  children: ReactNode;
}

/** Mobile-only bottom bar that keeps the primary Play action in reach. */
export function GameStickyPlayBar({
  watchId,
  children,
}: GameStickyPlayBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(watchId);
    if (!target || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      // Only after the panel has scrolled above the viewport.
      setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [watchId]);

  // Not rendered while hidden so the action never duplicates the hero's.
  if (!visible) return null;

  return (
    <div
      data-testid="game-sticky-play"
      className="box-border fixed inset-x-0 bottom-0 z-40 lg:hidden px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-[var(--borderColor)] bg-[var(--glassBg)] backdrop-blur-xl"
    >
      <div className="box-border mx-auto flex max-w-md [&>*]:w-full [&_button]:w-full">
        {children}
      </div>
    </div>
  );
}
