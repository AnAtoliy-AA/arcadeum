'use client';

import React, { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';
import { CARD_VARIANTS } from '@/features/games/lib/criticalVariants';

const HERO_VARIANT_IDS = ['fantasy', 'galaxy', 'steampunk'] as const;
const MAX_TILT_DEG = 8;

export function HeroCardStack({ playLabel }: { playLabel: string }) {
  const stackRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { t } = useTranslation();
  const routes = useRoutes();

  const heroCards = HERO_VARIANT_IDS.map((id) => {
    const v = CARD_VARIANTS.find((c) => c.id === id);
    return { id, nameKey: v?.name ?? '', bgImage: v?.bgImage };
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
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
    stack.style.setProperty('--tilt-x', `${px * MAX_TILT_DEG * 2}deg`);
    stack.style.setProperty('--tilt-y', `${-py * MAX_TILT_DEG * 2}deg`);
  };

  const handlePointerLeave = () => {
    const stack = stackRef.current;
    if (!stack) return;
    stack.style.setProperty('--tilt-x', '0deg');
    stack.style.setProperty('--tilt-y', '0deg');
    setHoveredIndex(null);
  };

  const handleCardEnter = useCallback(
    (index: number) => setHoveredIndex(index),
    [],
  );
  const handleCardLeave = useCallback(() => setHoveredIndex(null), []);

  return (
    <div data-testid="hero-visual" className="hero-visual-main fade-on-mount">
      <div
        ref={stackRef}
        className="hero-card-stack-main hero-card-stack"
        data-testid="hero-card-stack"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {heroCards.map((card, index) => {
          const isLast = index === heroCards.length - 1;
          const x = (index - 1) * 65;
          const rotate = `${(index - 1) * 12}deg`;
          const y = index * -15;
          const isActive = hoveredIndex === index;

          return (
            <div
              key={index}
              className={`hero-card-main${isActive ? ' hero-card-active' : ''}`}
              style={
                {
                  '--card-x': `${x}px`,
                  '--card-y': `${y}px`,
                  '--card-rotate': rotate,
                  '--card-scale': isLast ? 1 : 0.95,
                  zIndex: isActive ? 100 : index,
                  opacity: isLast ? 1 : 0.8,
                } as React.CSSProperties
              }
              data-testid={`hero-card-${index}`}
              onPointerEnter={() => handleCardEnter(index)}
              onPointerLeave={handleCardLeave}
            >
              {card.bgImage ? (
                <Image
                  src={card.bgImage}
                  alt={`${t(card.nameKey as TranslationKey)} game card preview`}
                  fill
                  priority={isLast}
                  sizes="(max-width: 1150px) 60vw, 280px"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjM4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMzIzNTNkIiB3aWR0aD0iMjgwIiBoZWlnaHQ9IjM4MCIvPjwvc3ZnPg=="
                  className="hero-card-image"
                />
              ) : null}
              <div className="hero-card-scrim hero-card-scrim-top" />
              <div className="hero-card-scrim hero-card-scrim-bottom" />
              <div className="hero-card-name">
                {t(card.nameKey as TranslationKey) || card.nameKey}
              </div>
              <div className="hero-card-brand">CRITICAL</div>
              <Link
                href={`${routes.gameCreate}?variant=${card.id}`}
                className="hero-card-play-cta"
                data-testid={`hero-play-cta-${index}`}
              >
                {playLabel}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
