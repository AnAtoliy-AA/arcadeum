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
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-background">
      <Image
        src={DEFAULT_HERO_BG}
        alt="Arcadeum glowing board game table background"
        fill
        priority
        fetchPriority="high"
        quality={40}
        sizes="(max-width: 1200px) 100vw, 1200px"
        className="hero-background-image hidden h-full w-full object-cover object-center [filter:saturate(1.15)_brightness(0.85)] md:block"
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
          className={`hero-background-image hidden h-full w-full object-cover object-center opacity-0 transition-opacity duration-[0.8s] ease-in-out [filter:saturate(1.15)_brightness(0.85)] min-[1151px]:block ${
            bgImage === src ? 'active opacity-100' : ''
          }`}
        />
      ))}
      <div className="absolute inset-0 z-[1] bg-hero-overlay-mobile before:absolute before:-left-[10%] before:-top-[10%] before:h-[120%] before:w-[120%] before:bg-hero-glow before:opacity-80 after:absolute after:inset-0 after:bg-hero-noise after:opacity-[0.025] after:mix-blend-overlay md:bg-hero-overlay md:before:-left-[30%] md:before:-top-[30%] md:before:h-[160%] md:before:w-[160%]" />
    </div>
  );
}
