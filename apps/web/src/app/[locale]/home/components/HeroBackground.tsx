'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  useHeroBackgroundStore,
  DEFAULT_HERO_BG,
} from '../store/heroBackgroundStore';

const VARIANT_IMAGES = [
  '/images/variants/fantasy_bg.webp',
  '/images/variants/galaxy_bg.webp',
  '/images/variants/steampunk_bg.webp',
];

export function HeroBackground() {
  const bgImage = useHeroBackgroundStore((s) => s.bgImage);
  const [loadedVariants, setLoadedVariants] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.matchMedia('(min-width: 1151px)').matches;
  });

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1151px)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(!e.matches);
    };
    mql.addEventListener('change', handleChange);
    return () => {
      mql.removeEventListener('change', handleChange);
    };
  }, []);

  const [prevBgImage, setPrevBgImage] = useState(bgImage);
  if (bgImage !== prevBgImage) {
    setPrevBgImage(bgImage);
    if (
      bgImage !== DEFAULT_HERO_BG &&
      !loadedVariants.has(bgImage) &&
      VARIANT_IMAGES.includes(bgImage)
    ) {
      setLoadedVariants((prev) => {
        const next = new Set(prev);
        next.add(bgImage);
        return next;
      });
    }
  }

  const shouldShowVariants = !isMobile;

  const handleImageLoad = useCallback(
    (src: string) => {
      if (!loadedVariants.has(src)) {
        setLoadedVariants((prev) => new Set(prev).add(src));
      }
    },
    [loadedVariants],
  );

  return (
    <div className="hero-background-image-container">
      <Image
        src={DEFAULT_HERO_BG}
        alt="Arcadeum glowing board game table background"
        fill
        priority
        fetchPriority="high"
        quality={75}
        sizes="(max-width: 768px) 768px, (max-width: 1200px) 1200px, 100vw"
        className={`hero-background-image ${bgImage === DEFAULT_HERO_BG ? 'active' : ''}`}
      />
      {shouldShowVariants &&
        VARIANT_IMAGES.filter(
          (src) => loadedVariants.has(src) || bgImage === src,
        ).map((src) => (
          <Image
            key={src}
            src={src}
            alt={`${src.split('/').pop()?.replace('_bg.webp', '')} background`}
            fill
            quality={70}
            loading="lazy"
            sizes="(max-width: 1200px) 1200px, 100vw"
            className={`hero-background-image ${bgImage === src ? 'active' : ''}`}
            onLoad={() => handleImageLoad(src)}
          />
        ))}
      <div className="hero-background-overlay" />
    </div>
  );
}
