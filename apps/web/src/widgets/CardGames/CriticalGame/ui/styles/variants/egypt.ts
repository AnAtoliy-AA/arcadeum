import { VariantStyleConfig } from './types';
import { baseVariantStyles } from './base';

export const egyptVariantStyles: VariantStyleConfig = {
  ...baseVariantStyles,
  scene: {
    ...baseVariantStyles.scene,
    sceneBgGradient:
      'radial-gradient(circle at 50% 20%, rgba(180, 83, 9, 0.24) 0%, rgba(20, 15, 5, 1) 45%, rgba(0, 0, 0, 1) 100%)',
    gridLineColorA: 'rgba(217, 119, 6, 0.15)',
    gridLineColorB: 'rgba(30, 58, 138, 0.1)',
    sceneBackgroundImage: '/images/variants/egypt_bg.webp',
    particleColors: [
      'rgba(217, 119, 6, 0.8)',
      'rgba(30, 58, 138, 0.7)',
      'rgba(251, 191, 36, 0.6)',
    ],
    turnBannerBorderGradient: 'linear-gradient(90deg, #b45309, #1e3a8a)',
    turnBannerDotColor: '#b45309',
  },
  cards: {
    ...baseVariantStyles.cards,
    getCardSpriteUrl: () => '/images/cards/egypt_sprites.png',
  },
};
