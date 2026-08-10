'use client';

import React, { useRef, useState, useCallback, type ReactNode } from 'react';
import { useHeroBackgroundStore } from '../store/heroBackgroundStore';

const MAX_TILT_DEG = 8;
const FAN_OFFSET = 140;

function indexFromPointerX(clientX: number, stack: HTMLDivElement): number {
  const rect = stack.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const dx = clientX - cx;
  if (dx < -FAN_OFFSET / 2) return 0;
  if (dx > FAN_OFFSET / 2) return 2;
  return 1;
}

const HERO_BG_IMAGES = [
  '/images/variants/fantasy_bg.webp',
  '/images/variants/galaxy_bg.webp',
  '/images/variants/steampunk_bg.webp',
];

export function HeroCardStack({
  children,
  playLabel: _playLabel,
}: {
  children: ReactNode;
  playLabel: string;
}) {
  const stackRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const pointerDownRef = useRef(false);
  const setBgImage = useHeroBackgroundStore((s) => s.setBgImage);
  const resetBgImage = useHeroBackgroundStore((s) => s.resetBgImage);

  React.useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    const cards = stack.querySelectorAll('.hero-card-main');
    cards.forEach((card, i) => {
      card.classList.add('is-hydrated');
      if (i === hoveredIndex) card.classList.add('hero-card-active');
      else card.classList.remove('hero-card-active');
    });
  }, [hoveredIndex]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const stack = stackRef.current;
      if (!stack) return;
      if (
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      )
        return;

      const rect = stack.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      stack.style.transform = `perspective(600px) rotateY(${px * MAX_TILT_DEG * 2}deg) rotateX(${-py * MAX_TILT_DEG * 2}deg)`;

      if (!pointerDownRef.current) {
        const nextHovered = indexFromPointerX(e.clientX, stack);
        setHoveredIndex(nextHovered);
        const bg = HERO_BG_IMAGES[nextHovered];
        if (bg) setBgImage(bg);
      }
    },
    [setBgImage],
  );

  const handlePointerDown = useCallback(() => {
    pointerDownRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    pointerDownRef.current = false;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const stack = stackRef.current;
    if (!stack) return;
    stack.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg)';
    pointerDownRef.current = false;
    setHoveredIndex(null);
    resetBgImage();
  }, [resetBgImage]);

  return (
    <div
      ref={stackRef}
      className="hero-card-stack-main hero-card-stack"
      data-testid="hero-card-stack"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </div>
  );
}
