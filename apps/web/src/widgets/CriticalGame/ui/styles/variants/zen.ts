import { VariantStyleConfig } from './types';
import { baseVariantStyles } from './base';

export const zenVariantStyles: VariantStyleConfig = {
  ...baseVariantStyles,
  scene: {
    ...baseVariantStyles.scene,
    sceneBgGradient:
      'radial-gradient(circle at 50% 20%, rgba(219, 39, 119, 0.24) 0%, rgba(15, 23, 42, 1) 45%, rgba(0, 0, 0, 1) 100%)',
    gridLineColorA: 'rgba(236, 72, 153, 0.15)',
    gridLineColorB: 'rgba(30, 64, 175, 0.1)',
    sceneBackgroundImage: '/images/variants/zen_bg.png',
    particleColors: [
      'rgba(236, 72, 153, 0.8)',
      'rgba(30, 64, 175, 0.7)',
      'rgba(219, 39, 119, 0.6)',
    ],
    turnBannerBorderGradient: 'linear-gradient(90deg, #db2777, #1e3a8a)',
    turnBannerDotColor: '#db2777',
  },
  cards: {
    ...baseVariantStyles.cards,
    getCardSpriteUrl: () => '/images/cards/zen_sprites.png',
  },
};
