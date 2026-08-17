'use client';

import Image from 'next/image';
import {
  useHeroBackgroundStore,
  DEFAULT_HERO_BG,
} from '../store/heroBackgroundStore';

const HERO_BG_FILTER = '[filter:saturate(0.9)_brightness(0.55)] opacity-60';

export function HeroBackground() {
  const accentGlow = useHeroBackgroundStore((s) => s.accentGlow);

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
        className={`hero-background-image hidden h-full w-full object-cover object-center ${HERO_BG_FILTER} md:block`}
      />

      <div
        className="hero-dynamic-ambient absolute inset-0 transition-opacity duration-700 ease-out"
        style={{
          background: `radial-gradient(circle at 65% 45%, ${accentGlow} 0%, transparent 60%)`,
        }}
      />

      <div className="absolute inset-0 z-[1] bg-hero-overlay-mobile before:absolute before:-left-[10%] before:-top-[10%] before:h-[120%] before:w-[120%] before:bg-hero-glow before:opacity-60 after:absolute after:inset-0 after:bg-hero-noise after:opacity-[0.025] after:mix-blend-overlay md:bg-hero-overlay md:before:-left-[30%] md:before:-top-[30%] md:before:h-[160%] md:before:w-[160%]" />
    </div>
  );
}
