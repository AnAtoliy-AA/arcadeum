/**
 * Hero fan-card variants — single source of truth shared by HomeHero
 * (card links), HeroBackground (swap background) and HeroCardStack
 * (hover-driven background switching). Keep the array order stable: the
 * hover logic maps pointer position → array index.
 */
export const HERO_VARIANTS = [
  { id: 'fantasy', bgImage: '/images/variants/fantasy_bg.webp' },
  { id: 'galaxy', bgImage: '/images/variants/galaxy_bg.webp' },
  { id: 'steampunk', bgImage: '/images/variants/steampunk_bg.webp' },
] as const;

export const HERO_VARIANT_BG_IMAGES: readonly string[] = HERO_VARIANTS.map(
  (variant) => variant.bgImage,
);

/** Horizontal spread between fan-card centers in px. */
export const HERO_CARD_FAN_OFFSET = 140;
