import { VariantStyleConfig } from './types';
import { baseVariantStyles } from './base';

export const westernVariantStyles: VariantStyleConfig = {
  ...baseVariantStyles,
  scene: {
    ...baseVariantStyles.scene,
    sceneBgGradient:
      'radial-gradient(circle at 50% 20%, rgba(154, 52, 18, 0.24) 0%, rgba(44, 24, 16, 1) 45%, rgba(0, 0, 0, 1) 100%)',
    gridLineColorA: 'rgba(194, 65, 12, 0.15)',
    gridLineColorB: 'rgba(253, 230, 138, 0.1)',
    sceneBackgroundImage: '/images/variants/western_bg.png',
    particleColors: [
      'rgba(194, 65, 12, 0.8)',
      'rgba(253, 230, 138, 0.7)',
      'rgba(124, 45, 18, 0.6)',
    ],
    turnBannerBorderGradient: 'linear-gradient(90deg, #78350f, #d97706)',
    turnBannerDotColor: '#78350f',
  },
  cards: {
    ...baseVariantStyles.cards,
    getCardSpriteUrl: () => '/images/cards/western_sprites.png',
  },
};
