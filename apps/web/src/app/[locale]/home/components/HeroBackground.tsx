'use client';

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

  return (
    <div className="hero-background-image-container">
      <Image
        src={DEFAULT_HERO_BG}
        alt="Arcadeum glowing board game table background"
        fill
        priority
        fetchPriority="high"
        quality={40}
        sizes="(max-width: 1200px) 100vw, 1200px"
        className={`hero-background-image hero-bg-default ${bgImage === DEFAULT_HERO_BG ? 'active' : ''}`}
      />
      {VARIANT_IMAGES.filter((src) => bgImage === src).map((src) => (
        <Image
          key={src}
          src={src}
          alt={`${src.split('/').pop()?.replace('_bg.webp', '')} background`}
          fill
          quality={70}
          loading="lazy"
          sizes="(max-width: 1200px) 1200px, 100vw"
          className={`hero-background-image ${bgImage === src ? 'active' : ''}`}
        />
      ))}
      <div className="hero-background-overlay" />
    </div>
  );
}
