import { VariantStyleConfig } from './types';
import { baseVariantStyles } from './base';

export const fantasyVariantStyles: VariantStyleConfig = {
  ...baseVariantStyles,
  scene: {
    ...baseVariantStyles.scene,
    sceneBgGradient:
      'radial-gradient(circle at 50% 20%, rgba(6, 95, 70, 0.24) 0%, rgba(20, 20, 10, 1) 45%, rgba(0, 0, 0, 1) 100%)',
    gridLineColorA: 'rgba(5, 150, 105, 0.15)',
    gridLineColorB: 'rgba(212, 175, 55, 0.1)',
    sceneBackgroundImage: '/images/variants/fantasy_bg.png',
    particleColors: [
      'rgba(5, 150, 105, 0.8)',
      'rgba(212, 175, 55, 0.7)',
      'rgba(16, 185, 129, 0.6)',
    ],
    turnBannerBorderGradient: 'linear-gradient(90deg, #065f46, #d4af37)',
    turnBannerDotColor: '#065f46',
  },
};
