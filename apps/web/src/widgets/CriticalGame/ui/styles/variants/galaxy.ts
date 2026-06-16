import { VariantStyleConfig } from './types';
import { baseVariantStyles } from './base';

export const galaxyVariantStyles: VariantStyleConfig = {
  ...baseVariantStyles,
  scene: {
    ...baseVariantStyles.scene,
    sceneBgGradient:
      'radial-gradient(circle at 50% 20%, rgba(107, 33, 168, 0.24) 0%, rgba(15, 23, 42, 1) 45%, rgba(0, 0, 0, 1) 100%)',
    gridLineColorA: 'rgba(139, 92, 246, 0.15)',
    gridLineColorB: 'rgba(30, 64, 175, 0.1)',
    sceneBackgroundImage: '/images/variants/galaxy_bg.webp',
    particleColors: [
      'rgba(139, 92, 246, 0.8)',
      'rgba(30, 64, 175, 0.7)',
      'rgba(236, 72, 153, 0.6)',
    ],
    turnBannerBorderGradient: 'linear-gradient(90deg, #6b21a8, #1e3a8a)',
    turnBannerDotColor: '#6b21a8',
  },
  cards: {
    ...baseVariantStyles.cards,
    getCardSpriteUrl: () => '/images/cards/galaxy_sprites.png',
  },
};
