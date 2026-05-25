import { VariantStyleConfig } from './types';
import { baseVariantStyles } from './base';

export const steampunkVariantStyles: VariantStyleConfig = {
  ...baseVariantStyles,
  scene: {
    ...baseVariantStyles.scene,
    sceneBgGradient:
      'radial-gradient(circle at 50% 20%, rgba(120, 53, 15, 0.24) 0%, rgba(28, 25, 23, 1) 45%, rgba(0, 0, 0, 1) 100%)',
    gridLineColorA: 'rgba(180, 83, 9, 0.15)',
    gridLineColorB: 'rgba(254, 243, 199, 0.1)',
    sceneBackgroundImage: '/images/variants/steampunk_bg.png',
    particleColors: [
      'rgba(180, 83, 9, 0.8)',
      'rgba(254, 243, 199, 0.7)',
      'rgba(120, 53, 15, 0.6)',
    ],
    turnBannerBorderGradient: 'linear-gradient(90deg, #78350f, #fef3c7)',
    turnBannerDotColor: '#78350f',
  },
  cards: {
    ...baseVariantStyles.cards,
    getCardSpriteUrl: () => '/images/cards/steampunk_sprites.png',
  },
};
