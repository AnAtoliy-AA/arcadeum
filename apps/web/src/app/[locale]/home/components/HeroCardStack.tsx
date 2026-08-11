'use client';

import React, { useRef, useState, useCallback, type ReactNode } from 'react';
import { useHeroBackgroundStore } from '../store/heroBackgroundStore';

const FAN_OFFSET = 140;

const HERO_BG_IMAGES = [
  '/images/variants/fantasy_bg.webp',
  '/images/variants/galaxy_bg.webp',
  '/images/variants/steampunk_bg.webp',
];

function indexFromPointerX(clientX: number, stack: HTMLDivElement): number {
  const rect = stack.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const dx = clientX - cx;
  if (dx < -FAN_OFFSET / 2) return 0;
  if (dx > FAN_OFFSET / 2) return 2;
  return 1;
}

export function HeroCardStack({
  children,
  playLabel: _playLabel,
}: {
  children: ReactNode;
  playLabel: string;
}) {
  const stackRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const rafRef = useRef(0);
  const setBgImage = useHeroBackgroundStore((s) => s.setBgImage);
  const resetBgImage = useHeroBackgroundStore((s) => s.resetBgImage);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const stack = stackRef.current;
      if (!stack) return;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!stack) return;
        const rect = stack.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;

        stack.style.setProperty('--tilt-x', `${px * 16}deg`);
        stack.style.setProperty('--tilt-y', `${-py * 16}deg`);

        const nextHovered = indexFromPointerX(e.clientX, stack);
        setHoveredIndex(nextHovered);
        const bg = HERO_BG_IMAGES[nextHovered];
        if (bg) setBgImage(bg);
      });
    },
    [setBgImage],
  );

  const handlePointerLeave = useCallback(() => {
    const stack = stackRef.current;
    if (!stack) return;
    cancelAnimationFrame(rafRef.current);
    stack.style.setProperty('--tilt-x', '0deg');
    stack.style.setProperty('--tilt-y', '0deg');
    setHoveredIndex(null);
    resetBgImage();
  }, [resetBgImage]);

  return (
    <div
      ref={stackRef}
      className="hero-card-stack-main hero-card-stack"
      data-testid="hero-card-stack"
      data-hovered={hoveredIndex ?? ''}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </div>
  );
}
